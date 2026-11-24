import { IsArray, IsOptional } from 'class-validator';

// PUT api/corporate-cards/bulk-decision
export class CorporateCardBulkDecisionDto {
  @IsOptional()
  @IsArray()
  approveIds?: number[];

  @IsOptional()
  @IsArray()
  rejectIds?: number[];

  // admin user id; falls back to the logged-in user
  @IsOptional()
  approvedBy?: number;

  @IsOptional()
  approvalRemarks?: string;
}
