import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaymentGateway } from 'src/core/orm/entities/payment-gateway.entity';
import { CreatePaymentGatewayDto } from './dto/create-payment-gateway.dto';
import { PaymentGatewayPaginatedDto } from './dto/payment-gateway-paginated.dto';
import { UpdatePaymentGatewayDto } from './dto/update-payment-gateway.dto';

@Injectable()
export class PaymentGatewayService {
  // 1. CREATE
  async create(dto: CreatePaymentGatewayDto, req?: any) {
    const item = await PaymentGateway.query().insertAndFetch({
      name :dto.name,
      status :dto.status,
      logo :dto.logo,
    });
    return item;
  }

  // 2. PAGINATED
  async paginated(data: any = {}) {
    const dto: PaymentGatewayPaginatedDto = data.dto 
    const query = PaymentGateway.query();

    if (dto.search) {
      query.where((builder) => {
        builder.where('name', 'like', `%${dto.search}%`);
      });
    }

    if (dto.status) {
      query.where('status', dto.status);
    }


    query.orderBy('id', 'desc');

    return await PaymentGateway.pagination(query, data);
  }

  // 3. READ BY ID
  async findOne(id: number) {
    const item = await PaymentGateway.query().findById(id);
    if (!item) {
      throw new HttpException('Payment gateway not found', HttpStatus.NOT_FOUND);
    }
    return item;
  }

  // 4. UPDATE
  async update(dto: UpdatePaymentGatewayDto, authId?: number) {
    await this.findOne(dto.id);
    const updated = await PaymentGateway.query().patchAndFetchById(dto.id, {
            name :dto.name,
      status :dto.status,
      logo :dto.logo,
    });
    return updated;
  }

  // 5. DELETE
  async delete(id: number) {
    await this.findOne(id);
    await PaymentGateway.query().deleteById(id);
    return true;
  }
}
