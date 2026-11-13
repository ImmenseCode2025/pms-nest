import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class SyncDto {
  @IsNotEmpty()
  @IsInt()
  site_id: number;

  // 0 = pehli sync (poori list), N = N k baad ki changes
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  after_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number;
}
