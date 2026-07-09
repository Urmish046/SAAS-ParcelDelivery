import { IsEmail, IsNotEmpty, IsEnum, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '../models/user.model';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password!: string;

  @IsEnum(UserRole, { message: 'Role must be one of: super_admin, company_admin, china_staff, nigeria_staff.' })
  @IsNotEmpty({ message: 'Role is required when creating staff.' })
  role!: UserRole;

  @IsOptional()
  companyId?: string;
}