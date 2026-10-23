import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
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

  @IsOptional()
  @IsEnum(HandheldPaymentMethodEnum, {
    message: `paymentMethod must be one of: ${Object.values(HandheldPaymentMethodEnum).join(', ')}`,
  })
  paymentMethod?: HandheldPaymentMethodEnum;

  @IsNotEmpty()
  @IsString()
  creationDate: string;

  @ValidateIf((o) => o.paymentMethod && o.paymentMethod !== HandheldPaymentMethodEnum.SKIP)
  @IsNotEmpty()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  onlinePaymentReference?: string;

  @IsNotEmpty()
  @IsString()
  siteId: string;
}

export class TicketEaseDto {
  @IsNotEmpty()
  vehicleNumber: string;

  @IsNotEmpty()
  ticketNumber: string;

  @IsNotEmpty()
  creationDate: string;

  @IsNotEmpty()
  checkoutDateTime: string;

  @IsNotEmpty()
  deviceId: string;

  @IsNotEmpty()
  vehicleType: string;


  @IsNotEmpty()
  paymentMethod: string;

  @IsOptional()
  paymentReference?: string;
}

