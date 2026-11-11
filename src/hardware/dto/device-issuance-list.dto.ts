import { IsIn, IsOptional, IsString } from 'class-validator';

// Query for GET api/hardware/device-issuance (all hardware types, paginated)
export class DeviceIssuanceListDto {
  @IsOptional()
  page?: number | string;

  // Page size: `limit` (Nest convention) or `pageSize` (legacy name)
  @IsOptional()
  limit?: number | string;

  @IsOptional()
  pageSize?: number | string;

  // Matches part name (sku), Ip/Api (ipOrApi) or assigned user's username
  @IsOptional()
  @IsString()
  search?: string;

  // Optional legacy location filter: only hardware assigned to a parking site of that company
  @IsOptional()
  @IsIn(['karachi', 'islamabad', ''])
  location?: string;
}
