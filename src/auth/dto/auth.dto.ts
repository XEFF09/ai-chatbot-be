import { IsString, IsEmail, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password?: string;
}
