import { IsNotEmpty, IsString } from 'class-validator';

export class ShiftSummaryDto {

  @IsNotEmpty({ message: 'siteId is required' })
  siteId: string | number;

  @IsNotEmpty({ message: 'date is required (format: YYYY-MM-DD)' })
  @IsString()
  date: string;

  @IsNotEmpty({ message: "shiftTime is required ('morning' or 'evening')" })
  @IsString()
  shiftTime: string;

  @IsNotEmpty()
  handheldId: string;
}
