import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

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
}