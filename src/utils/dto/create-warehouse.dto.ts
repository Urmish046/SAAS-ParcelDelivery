import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsUUID()
@IsOptional()
companyId?: string;
}