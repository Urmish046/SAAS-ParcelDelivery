import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTrackingRequestDto {
  @IsString()
  @IsNotEmpty()
  trackingNumber!: string;
}