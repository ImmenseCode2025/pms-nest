import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { HandheldPaymentMethodEnum, VehicleTypeEnum } from 'src/core/helper/enum/global.enum';

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
  @IsEnum(VehicleTypeEnum, {
    message: `vehicleType must be one of: ${Object.values(VehicleTypeEnum).join(', ')}`,
  })
  vehicleType: VehicleTypeEnum;

  @IsNotEmpty()
  @IsEnum(HandheldPaymentMethodEnum, {
    message: `paymentMethod must be one of: ${Object.values(HandheldPaymentMethodEnum).join(', ')}`,
  })
  paymentMethod: HandheldPaymentMethodEnum;

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
