import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtSignProps } from 'src/auth/types/type.jwt';
import { UserRole } from 'src/types/type.role';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll() {
    const res = await this.userModel.find().exec();

    if (!res) {
      throw new InternalServerErrorException(
        `could not retrieve users from database`,
      );
    }

    return {
      message: `users retrieved successfully`,
      data: res,
    };
  }

  async findOne(email: string, loginUser: JwtSignProps) {
    const res = await this.userModel.findOne({ email }).exec();

    if (!res) {
      throw new NotFoundException(`user:${email} not found`);
    }

    if (res.email !== loginUser.email && loginUser.role != UserRole.Admin) {
      throw new ForbiddenException(
        `no permission to access user:${email} data`,
      );
    }

    return {
      message: `user:${email} retrieved successfully`,
      data: res,
    };
  }

  async update(email: string, updateUserDto: UpdateUserDto) {
    const found = await this.userModel.findOne({ email }).exec();

    if (!found) {
      throw new NotFoundException(`user:${email} not found`);
    }

    const res = await this.userModel.updateOne({ email }, updateUserDto).exec();

    if (!res) {
      throw new InternalServerErrorException(
        `could not update user:${email} in database`,
      );
    }

    return {
      message: `user:${email} updated successfully`,
    };
  }

  async remove(email: string) {
    const found = await this.userModel.findOne({ email }).exec();

    if (!found) {
      throw new NotFoundException(`user:${email} not found`);
    }

    const res = await this.userModel.deleteOne({ email }).exec();

    if (!res) {
      throw new InternalServerErrorException(
        `could not delete user:${email} from database`,
      );
    }

    return {
      message: `user:${email} deleted successfully`,
    };
  }
}
