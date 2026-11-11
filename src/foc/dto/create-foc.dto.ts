import { IsNotEmpty } from 'class-validator';

// multipart/form-data (optional file field: profilePic)
export class CreateFocDto {
  @IsNotEmpty()
  siteName: string; // parking site id

  @IsNotEmpty()
  employeeId: string;

  @IsNotEmpty()
  employeeName: string;

  @IsNotEmpty()
  dateHiring: string; // YYYY-MM-DD

  @IsNotEmpty()
  company: string; // company id

  @IsNotEmpty()
  designation: string; // designation id

  @IsNotEmpty()
  shiftTimeFrom: string; // HH:mm

  @IsNotEmpty()
  shiftTimeTo: string; // HH:mm
}
