import { IsArray, IsNotEmpty } from 'class-validator';

class ParkingSitePricingDto {
  @IsNotEmpty()
  vehicle_type_id: number;

  @IsNotEmpty()
  amount: string;
}

export class RegisterParkingSiteDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  latitude: string;

  @IsNotEmpty()
  longitude: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  area: string;

  @IsArray()
  pricing: ParkingSitePricingDto[];
}
