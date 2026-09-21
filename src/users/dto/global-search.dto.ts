import { IsEnum, IsOptional } from 'class-validator';
import { GlobalSearchTypeEnum } from 'src/core/helper/enum/global.enum';

export class GlobalSearchDto {
  @IsOptional()
  search_text: string;

  @IsOptional()
  @IsEnum(GlobalSearchTypeEnum)
  search_type: GlobalSearchTypeEnum;
}
