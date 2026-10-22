import { IsNotEmpty, IsString } from 'class-validator';

export class AddHandheldReceiptDto {
  @IsNotEmpty()
  @IsString()
  ticketNumber: string;

  @IsNotEmpty()
  @IsString()
  vehicleNumber: string;

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsString()
  vehicleType: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsNotEmpty()
  @IsString()
  creationDate: string;

  @IsNotEmpty()
  @IsString()
  paymentReference: string;

  @IsNotEmpty()
  @IsString()
  onlinePaymentReference: string;

  @IsNotEmpty()
  @IsString()
  siteId: string;
}
