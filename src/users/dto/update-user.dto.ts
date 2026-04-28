import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly username?: string;

  @IsEnum(['admin', 'user'])
  @IsOptional()
  readonly role?: string;
}
