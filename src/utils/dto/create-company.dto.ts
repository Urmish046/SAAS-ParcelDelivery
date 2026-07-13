import { IsString, IsNotEmpty, MinLength, Matches, IsEmail } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name cannot be empty!' })
  @MinLength(3, { message: 'Company name must be at least 3 characters long.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Subdomain is required for registration.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Subdomain can only contain lowercase letters, numbers, and hyphens.',
  })
  subdomain!: string;

  @IsEmail({}, { message: 'Please provide a valid admin email address.' })
  @IsNotEmpty({ message: 'Admin email is required.' })
  adminEmail!: string;

  @IsString()
  @IsNotEmpty({ message: 'Admin password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password!: string;
}