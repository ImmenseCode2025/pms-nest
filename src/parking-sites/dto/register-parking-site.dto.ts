import { IsArray, IsObject } from 'class-validator';

export class RegisterParkingSiteDto {
  @IsObject()
  site: {
    name: string;
    latitude: number;
    longitude: number;
    area?: number | null;
    uom?: string;
    company: number;
  };

  @IsArray()
  block: any[];
}
