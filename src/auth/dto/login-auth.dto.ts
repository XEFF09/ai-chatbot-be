import { IsString, IsEmail } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @IsString()
  readonly email: string;

  @IsString()
  password: string;
}
