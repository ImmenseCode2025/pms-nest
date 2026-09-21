import { IsEnum, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { BasedPaginatedDto } from 'src/core/decorators/decorators-dto/based-paginated.dto';
import { FilterTypeForNumber } from 'src/core/decorators/filter-type-for-number.validator';
import { FilterTypeForString } from 'src/core/decorators/filter-type-for-string.validator';
import {
  AspiringStyleEnum,
  ColorPaletteEnum,
  CurrentStyleEnum,
} from 'src/core/helper/enum/global.enum';

export class EditProfileDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  phone_number: string;

  @IsOptional()
  profile_image: string;

  @IsNotEmpty()
  country: string;

  @IsOptional()
  state: string;

  @IsNotEmpty()
  city: string;
}

export class DeleteAccountDto {
  @IsNotEmpty()
  user_id: number;
}

export class UsersPaginatedDto {
  @IsOptional()
  @Validate(FilterTypeForNumber)
  userIdFilter: BasedPaginatedDto;

  @Validate(FilterTypeForString)
  @IsOptional()
  firstNameFilter: BasedPaginatedDto;

  @Validate(FilterTypeForString)
  @IsOptional()
  lastNameFilter: BasedPaginatedDto;

  @IsOptional()
  @Validate(FilterTypeForString)
  emailFilter: BasedPaginatedDto;

  @IsOptional()
  search_text: string;
}

export class SetPersonalInfoDto {
  @IsNotEmpty()
  @IsEnum(CurrentStyleEnum)
  current_style: CurrentStyleEnum;

  @IsNotEmpty()
  @IsEnum(AspiringStyleEnum)
  aspiring: AspiringStyleEnum;

  @IsNotEmpty()
  @IsEnum(ColorPaletteEnum)
  color_palettes: ColorPaletteEnum;
}
