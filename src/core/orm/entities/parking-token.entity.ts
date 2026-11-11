import { Mapping } from '../sql.model';
import { Hardware } from './hardware.entity';
import { ParkingPrice } from './parking-price.entity';
import { ParkingSite } from './parking-site.entity';
import { PaymentMethod } from './payment-method.entity';
import { VehicleType } from './vehicle-type.entity';
import { ParkingReceipt } from './parking-receipt.entity';

export class ParkingToken extends Mapping {
    static get tableName() {
    return 'parking_token';
  }

  id?: number;
  tokenNumber?: string;
  qrCode?: string;
  checkInDateTime?: Date | string;
  checkOutDateTime?: Date | string;
  site?: number;
  status?: 'active' | 'inactive' | 'expired';
  hardware?: number;
  lot?: number;
  generatedDateTime?: Date | string;
  customer?: number;
  vehicleType?: number;
  paymentMethod?: number;
  carNo?: string;
  isExited?: boolean | number;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      parking_site: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        modify(query) {
          query.select('id','name')
        },
        join: {
          from: 'parking_token.site',
          to: 'parking_site.id',
        },
      },
      parking_price: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingPrice,
        modify(query) {
          query.select('id', 'amount', 'vehicleType', 'siteId');
        },
        join: {
          from: [
            'parking_token.vehicleType',
            'parking_token.site',
          ],
          to: [
            'parking_price.vehicleType',
            'parking_price.siteId',
          ],
        },
      },
      parking_receipt: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingReceipt,
        join: {
          from: 'parking_token.tokenNumber',
          to: 'parking_receipt.ticketNumber',
        },
      },
      tokenHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        modify(query) {
          // query.select('id', 'partName', 'type', 'uniqueId');
        },
        join: {
          from: 'parking_token.hardware',
          to: 'hardware.id',
        },
      },
      vehicle_type: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        modify(query) {
          query.select('id','name')
        },
        join: {
          from: 'parking_token.vehicleType',
          to: 'vehicle_type.id',
        },
      },
      tokenPaymentMethod: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: PaymentMethod,
        join: {
          from: 'parking_token.paymentMethod',
          to: 'payment_method.id',
        },
      },
    };
  }
}
