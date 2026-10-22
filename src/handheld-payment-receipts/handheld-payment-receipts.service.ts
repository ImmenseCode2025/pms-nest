import { HttpStatus, Injectable } from '@nestjs/common';
import { ParkingReceipt } from 'src/core/orm/entities/parking-receipt.entity';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import { AddHandheldReceiptDto } from './dto/add-handheld-receipt.dto';

const ONLINE_PAYMENT_METHOD_NAME = 'online';
const ONLINE_PAYMENT_METHOD_ID = 18;
const ONLINE_PAYMENT_PROOF_DESTINATION = 'online-payment-proofs';
const ALLOWED_ONLINE_PAYMENT_PROOF_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);

const REQUIRED_FIELDS = [
  'ticketNumber',
  'vehicleNumber',
  'deviceId',
  'vehicleType',
  'paymentMethod',
  'creationDate',
];

const VEHICLE_TYPES = new Map<string, number>([
  ['car', 1],
  ['bus', 3],
  ['bike', 4],
  ['van', 5],
]);

// 'skip' is only valid for handheld and stores a NULL payment method
const PAYMENT_METHODS = new Map<string, number | null>([
  ['scratch card', 6],
  ['foc', 14],
  ['pos', 15],
  ['cash', 16],
  [ONLINE_PAYMENT_METHOD_NAME, ONLINE_PAYMENT_METHOD_ID],
  ['skip', null],
]);

export type HandheldReceiptResult = {
  status: number;
  body: Record<string, any>;
};

const invalidArgument = (errors: object[]): HandheldReceiptResult => ({
  status: HttpStatus.UNPROCESSABLE_ENTITY,
  body: { message: 'Invalid Argument!', errors, response: 'failed' },
});

const optionalValue = (value?: string): string | null => {
  const trimmed = value?.toString().trim();
  return trimmed ? trimmed : null;
};

// Equivalent of werkzeug's secure_filename
const secureFilename = (name: string): string =>
  name
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_.-]/g, '')
    .replace(/^[._]+/, '');

const fileExtension = (name: string): string => {
  const filename = secureFilename(name);
  return filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
};

@Injectable()
export class HandheldPaymentReceiptsService {
  constructor(private readonly filesUploadService: FilesUploadService) {}

  async add( dto: AddHandheldReceiptDto) {
    await ParkingReceipt.query().insertAndFetch({
      vehicleNumber: dto.vehicleNumber,
      deviceId: dto.deviceId,
      vehicleType: dto.vehicleNumber,
      paymentMethod: dto.paymentMethod,
      creationDate: dto.creationDate,
      ticketNumber: dto.ticketNumber,
      sourceHandheld: 1,
      checkoutDateTime: null,
      paymentReference: dto.paymentReference ?? null,
      onlinePaymentReference: dto.onlinePaymentReference ?? null,
      siteId: dto.siteId ?? null,
    })

    return 'Ticket generated successfully'
  }
}
