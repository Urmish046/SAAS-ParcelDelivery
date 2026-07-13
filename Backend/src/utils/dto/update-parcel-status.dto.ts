import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { ParcelStatus } from '../../models/parcel.model';

export class UpdateParcelStatusDto {
  @IsEnum(ParcelStatus)
  @IsNotEmpty()
  status!: ParcelStatus;

  @ValidateIf(o => o.status === ParcelStatus.SHIPPED)
  @IsString()
  @IsNotEmpty({ message: 'Customer tracking ID is required when shipping a parcel.' })
  customerTrackingId?: string;
}