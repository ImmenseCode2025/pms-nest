import { IsOptional } from 'class-validator';
import { FilterTypeEnum } from 'src/core/helper/enum/global.enum';

export class BasedPaginatedDto {
  @IsOptional()
  filter_type: FilterTypeEnum;

  @IsOptional()
  value: number;
}
