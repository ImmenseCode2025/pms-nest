import { Injectable } from '@nestjs/common';
import {
  HandheldPaymentMethodIdMap,
  VehicleTypeIdMap,
} from 'src/core/helper/enum/global.enum';
import { ParkingReceipt } from 'src/core/orm/entities/parking-receipt.entity';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import { AddHandheldReceiptDto } from './dto/add-handheld-receipt.dto';

@Injectable()
export class HandheldPaymentReceiptsService {
  constructor(private readonly filesUploadService: FilesUploadService) {}

  async add(dto: AddHandheldReceiptDto) {
    await ParkingReceipt.query().insertAndFetch({
      vehicleNumber: dto.vehicleNumber,
      deviceId: dto.deviceId,
      vehicleType: VehicleTypeIdMap[dto.vehicleType] ?? dto.vehicleType,
      paymentMethod:
        HandheldPaymentMethodIdMap[dto.paymentMethod] !== undefined
          ? HandheldPaymentMethodIdMap[dto.paymentMethod]
          : dto.paymentMethod,
      creationDate: dto.creationDate,
      ticketNumber: dto.ticketNumber,
      sourceHandheld: 1,
      checkoutDateTime: null,
      paymentReference: dto.paymentReference ?? null,
      onlinePaymentReference: dto.onlinePaymentReference ?? null,
      siteId: dto.siteId ?? null,
    } as any);

    return 'Ticket generated successfully';
  }
}
