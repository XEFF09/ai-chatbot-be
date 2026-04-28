import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  readonly email: string;

  @IsString()
  readonly username: string;

  @IsString()
  @MinLength(6)
  readonly password: string;
}
