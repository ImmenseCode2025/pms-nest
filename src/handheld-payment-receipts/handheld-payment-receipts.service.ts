import { Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import {
  HandheldPaymentMethodIdMap,
  VehicleTypeIdMap,
} from 'src/core/helper/enum/global.enum';
import { ParkingReceipt } from 'src/core/orm/entities/parking-receipt.entity';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import {
  AddHandheldReceiptDto,
  TicketEaseDto,
} from './dto/add-handheld-receipt.dto';

@Injectable()
export class HandheldPaymentReceiptsService {
  constructor(private readonly filesUploadService: FilesUploadService) {}

  async ticketCheckout(dto: TicketEaseDto) {
    const findOne = await ParkingReceipt.query()
      .whereRaw('LOWER(TRIM(ticketNumber)) = LOWER(?)', [dto.ticketNumber])
      .first();
    if (!findOne) {
      AppException.badRequest({ message: 'Ticket Number not found' });
    }

    await ParkingReceipt.query().updateAndFetchById(findOne.id, {
      sourceTicketEase: 1,
      checkoutDateTime: dto.checkoutDateTime,
       vehicleNumber: dto.vehicleNumber,
      deviceId: dto.deviceId,
      vehicleType: VehicleTypeIdMap[dto.vehicleType],
      paymentMethod: dto.paymentMethod ? (HandheldPaymentMethodIdMap[dto.paymentMethod] ?? null) : null,
      creationDate: dto.creationDate,
      ticketNumber: dto.ticketNumber,
      sourceHandheld: 1,
      paymentReference: dto.paymentReference ?? null,
      onlinePaymentReference: dto.onlinePaymentReference ?? null,
    });
    return true;
  }
  async add(files: any, dto: AddHandheldReceiptDto) {
    let onlinePaymentReferenceUrl = null;

    const proofFiles =
      files?.onlinePaymentReference ||
      (Array.isArray(files) ? files : null);

    if (proofFiles && (Array.isArray(proofFiles) ? proofFiles.length > 0 : true)) {
      const uploadResults = await this.filesUploadService.uploadFile(
        Array.isArray(proofFiles) ? proofFiles : [proofFiles],
        { destination: 'online-payment-proofs' } as any,
      );
      if (uploadResults && uploadResults.length > 0) {
        onlinePaymentReferenceUrl = uploadResults[0];
      }
    }
    let findOne = await ParkingReceipt.query().insertAndFetch({
      vehicleNumber: dto.vehicleNumber,
      deviceId: dto.deviceId,
      vehicleType: VehicleTypeIdMap[dto.vehicleType],
      paymentMethod: dto.paymentMethod ? (HandheldPaymentMethodIdMap[dto.paymentMethod] ?? null) : null,
      creationDate: dto.creationDate,
      ticketNumber: dto.ticketNumber,
      sourceHandheld: 1,
      checkoutDateTime: null,
      paymentReference: dto.paymentReference ?? null,
      onlinePaymentReference: onlinePaymentReferenceUrl,
      siteId: dto.siteId ?? null,
    } as any);

    return findOne;
  }
}
