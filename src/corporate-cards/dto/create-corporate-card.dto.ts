import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCorporateCardDto {
  @IsOptional()
  corporateId?: number;

  @IsOptional()
  corporate?: number;

  @IsOptional()
  requestId?: string;

  @IsOptional()
  requestStatus?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  cardStatus?: 'active' | 'inactive' | 'revoked';

  @IsOptional()
  requestDate?: Date | string;

  @IsOptional()
  approvalRemarks?: string;

  @IsOptional()
  vehicleNumber?: string;

  @IsOptional()
  vehicleType?: number;

  @IsOptional()
  ownerName?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  mobileNumber?: string;

  @IsOptional()
  vehicleBrand?: string;

  @IsOptional()
  vehicleModel?: string;

  @IsOptional()
  designation?: string;

  @IsOptional()
  dob?: Date | string;

  @IsOptional()
  approvedBy?: number;

  @IsOptional()
  approvedDate?: Date | string;

  @IsOptional()
  otpCode?: string;

  @IsOptional()
  otpExpired?: Date | string;

  @IsOptional()
  customer?: number;
}
