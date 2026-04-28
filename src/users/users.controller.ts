import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guard';
import { Roles } from '../auth/decorators/decorator.role';
import { UserRole } from '../types/type.role';
import { JwtSignProps } from 'src/auth/types/type.jwt';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.Admin)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':email')
  findOne(
    @Request() req: Request & { user: JwtSignProps },
    @Param('email') email: string,
  ) {
    const { user: loginUser } = req;
    return this.usersService.findOne(email, loginUser);
  }

  @Roles(UserRole.Admin)
  @Patch(':email')
  update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(email, updateUserDto);
  }

  @Roles(UserRole.Admin)
  @Delete(':email')
  remove(@Param('email') email: string) {
    return this.usersService.remove(email);
  }
}
