import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtSignProps } from './types/type.jwt';
import { UserRole } from 'src/types/type.role';

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
      role: user.role as UserRole,
    };

    return signProps;
  }

  loginWithJwt(user: JwtSignProps) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.userId,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginWithProvider(req: AuthDto) {
    const { email, username } = req;
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      const registerAuthDto: AuthDto = {
        email: email,
        username: username,
      };
      const res = await new this.userModel(registerAuthDto).save();

      if (!res) {
        throw new InternalServerErrorException(
          `could not save user:${registerAuthDto.email} to database`,
        );
      }

      const payload: JwtPayload = {
        email: res.email,
        sub: res._id.toString(),
        role: res.role as UserRole,
      };

      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role as UserRole,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(req: AuthDto) {
    if (req.password === undefined) {
      throw new InternalServerErrorException(`password is required`);
    }

    const hashedPass = await argon2.hash(req.password);
    req.password = hashedPass;

    const res = await new this.userModel(req).save();

    if (!res) {
      throw new InternalServerErrorException(
        `could not save user:${req.email} to database`,
      );
    }

    return {
      message: `user:${req.email} created successfully`,
    };
  }
}
