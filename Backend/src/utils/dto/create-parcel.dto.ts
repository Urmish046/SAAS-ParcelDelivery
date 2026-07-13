import { IsString, IsNotEmpty, IsUUID, IsNumber, IsOptional } from 'class-validator';

export class CreateParcelDto {
  @IsString()
  @IsNotEmpty()
  originalTrackingNumber!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;
}