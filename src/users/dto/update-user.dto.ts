import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';
import { UserRole } from '../roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsIn(['user', 'admin', 'super-admin'])
  role?: UserRole;
}
