import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtSignProps } from './types/type.jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<JwtSignProps> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException(`could not find user:${email}`);
    }

    const isVerified = await argon2.verify(user.password, password);

    if (!isVerified) {
      throw new InternalServerErrorException(`invalid credentials`);
    }

    const signProps: JwtSignProps = {
      email: user.email,
      userId: user._id.toString(),
    };

    return signProps;
  }

  loginWithJwt(user: JwtSignProps) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.userId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerAuthDto: RegisterAuthDto) {
    const hashedPass = await argon2.hash(registerAuthDto.password);
    registerAuthDto.password = hashedPass;

    const res = await new this.userModel(registerAuthDto).save();

    if (!res) {
      throw new InternalServerErrorException(
        `could not save user:${registerAuthDto.email} to database`,
      );
    }

    return {
      message: `user:${registerAuthDto.email} created successfully`,
    };
  }
}
