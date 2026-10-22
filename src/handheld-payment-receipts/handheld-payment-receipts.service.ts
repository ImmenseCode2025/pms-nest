import { Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import {
  HandheldPaymentMethodIdMap,
  VehicleTypeIdMap,
} from 'src/core/helper/enum/global.enum';
import { ParkingReceipt } from 'src/core/orm/entities/parking-receipt.entity';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import { AddHandheldReceiptDto, TicketEaseDto } from './dto/add-handheld-receipt.dto';

@Injectable()
export class HandheldPaymentReceiptsService {
  constructor(private readonly filesUploadService: FilesUploadService) {}

  async ticketEase(dto: TicketEaseDto) {

   let findOne =  await ParkingReceipt.query().where({ticketNumber: dto.ticketNumber}).first()

   if(!findOne){
    AppException.badRequest({message:'Ticket Number not found'})
   }
   
    await ParkingReceipt.query().updateAndFetchById(findOne.id,{
    sourceTicketEase:1, 
    checkoutDateTime:dto.checkoutDateTime, 
    })
   return true
  }
  async add(dto: AddHandheldReceiptDto) {
 let findOne  = await ParkingReceipt.query().insertAndFetch({
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

    return findOne;
  }
}
