import { IsOptional } from 'class-validator';

// GET api/corporate-cards?page&pageSize&search&group&location
export class CorporateCardRequestsQueryDto {
  @IsOptional()
  page?: string;

  @IsOptional()
  pageSize?: string;

  @IsOptional()
  search?: string;

  // 'true' | '1' => group rows by requestId
  @IsOptional()
  group?: string;

  // accepted for compatibility; legacy ignored it
  @IsOptional()
  location?: string;
}

// GET api/corporate-cards/qr-codes?page&pageSize&search&location
export class CorporateCardQrCodesQueryDto {
  @IsOptional()
  page?: string;

  @IsOptional()
  pageSize?: string;

  @IsOptional()
  search?: string;

  // accepted for compatibility; legacy ignored it
  @IsOptional()
  location?: string;
}
