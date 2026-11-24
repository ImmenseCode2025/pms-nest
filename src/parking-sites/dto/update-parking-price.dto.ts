import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class ParkingPriceItemDto {
  @IsNotEmpty({ message: 'vehicleType is required' })
  @Type(() => Number)
  @IsNumber()
  vehicleType: number;

  @IsNotEmpty({ message: 'amount is required for every vehicle type' })
  @Type(() => Number)
  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0)
  amount: number;
}

// PUT parking-sites/update-price
// Body: { siteId, prices: [{ vehicleType, amount }, ...] } — one row per vehicle type.
// Every active vehicle type must be present (checked in the service); each row is upserted.
export class UpdateParkingPriceDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  siteId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ParkingPriceItemDto)
  prices: ParkingPriceItemDto[];
}
