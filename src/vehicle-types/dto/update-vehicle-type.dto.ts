import { IsNotEmpty } from 'class-validator';

export class UpdateVehicleTypeDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;
}

