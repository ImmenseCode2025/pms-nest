import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

// PUT parking-sites/update-price (Flask parkingApp/updateParkingPrice).
// Legacy also sent defaultHour / additionalCharges / additionalChargesType /
// additionalChargesCategoryCount — those columns were dropped from
// parking_price, so they are accepted but ignored.
export class UpdateParkingPriceDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  siteId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  vehicleType: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  defaultHour?: any;

  @IsOptional()
  additionalCharges?: any;

  @IsOptional()
  additionalChargesType?: any;

  @IsOptional()
  additionalChargesCategoryCount?: any;
}
