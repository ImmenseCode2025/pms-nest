import { Injectable } from '@nestjs/common';
import { Company } from 'src/core/orm/entities/company.entity';
import { CompaniesDropdownDto } from './dto/companies-dropdown.dto';

@Injectable()
export class CompaniesService {
  async dropdown(dto: CompaniesDropdownDto = {}) {
    const query = Company.query()
      .select('company.id', 'company.name')
      .orderBy('company.name', 'asc');

    const city = dto.city?.trim().toLowerCase();
    if (city) {
      query
        .innerJoin('address', 'address.id', 'company.address')
        .whereRaw('LOWER(address.city) = ?', [city]);
    }
    return await query;
  }
}
