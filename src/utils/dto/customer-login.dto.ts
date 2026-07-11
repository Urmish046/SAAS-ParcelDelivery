import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CustomerLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsUUID()
  @IsNotEmpty()
  companyId!: string;
}