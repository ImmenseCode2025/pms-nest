import { IsIn, IsNotEmpty } from 'class-validator';

export class ShiftSummaryDto {
  @IsNotEmpty({ message: 'siteId is required' })
  siteId: string | number;

  @IsNotEmpty({ message: 'date is required' })
  @IsIn(['today', 'yesterday'])
  date: string;

  @IsNotEmpty()
  handheldId: string;
}
