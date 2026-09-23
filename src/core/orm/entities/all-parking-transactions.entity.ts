import { Mapping } from '../sql.model';
import { Company } from './company.entity';
import { ParkingSite } from './parking-site.entity';
import { VehicleType } from './vehicle-type.entity';

export class AllParkingTransactions extends Mapping {
  static get tableName() {
    return 'v_all_parking_transactions';
  }

  id?: number;
  source?: 'System' | 'Handheld' | 'TicketEase' | 'Handheld + TicketEase' | string;
  slip_number?: string;
  vehicle_number?: string;
  site_id?: number;
  site_name?: string;
  company_id?: number;
  vehicle_type_id?: number;
  vehicle_type_name?: string;
  amount?: number;
  check_in_date_time?: Date | string;
  check_out_date_time?: Date | string;
  status?: string;
  payment_method?: string;
  device_name?: string;

  static get relationMappings() {
    return {
      parkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        modify(query: any) {
          query.select('id', 'name');
        },
        join: {
          from: 'v_all_parking_transactions.site_id',
          to: 'parking_site.id',
        },
      },
      company: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: 'v_all_parking_transactions.company_id',
          to: 'company.id',
        },
      },
      vehicleType: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        modify(query: any) {
          query.select('id', 'name');
        },
        join: {
          from: 'v_all_parking_transactions.vehicle_type_id',
          to: 'vehicle_type.id',
        },
      },
    };
  }
}
