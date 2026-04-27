import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterAuthDto {
  @IsEmail()
  @IsString()
  readonly email: string;

  @IsString()
  readonly username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
