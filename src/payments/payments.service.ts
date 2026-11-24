import { Injectable } from '@nestjs/common';
import { Payment } from 'src/core/orm/entities/payment.entity';
import { SearchPaymentsDto } from './dto/search-payments.dto';

@Injectable()
export class PaymentsService {
  // Ticket payments list (Flask parkingApp/searchPayments).
  // Dates are returned as stored (Pakistan wall-clock), formatted in SQL.
  async search(dto: SearchPaymentsDto, query: any = {}) {
    const q = Payment.query()
      .select(
        'payment.id',
        'parking_token.tokenNumber as tokenNumber',
        'payment.amount',
        Payment.raw("DATE_FORMAT(payment.transactionDateTime, '%Y-%m-%d') as payDate"),
        Payment.raw("DATE_FORMAT(payment.transactionDateTime, '%H:%i:%s') as payTime"),
        'payment.category',
        'payment_gateway.name as gatewayName',
        'payment.status',
      )
      .leftJoin('payment_gateway', 'payment.paymentGateway', 'payment_gateway.id')
      .leftJoin('parking_token', 'payment.token', 'parking_token.id')
      .orderBy('payment.transactionDateTime', 'desc')
      .orderBy('payment.id', 'desc');

    const search = dto.search?.trim();
    if (search) {
      const like = `%${search}%`;
      q.where((b) => {
        b.where('parking_token.tokenNumber', 'like', like).orWhere(
          'payment_gateway.name',
          'like',
          like,
        );
      });
    }

    const data: any = await Payment.pagination(q, { query });
    data.results = (data.results || []).map((r: any) => ({
      id: r.id,
      tokenNumber: r.tokenNumber,
      amount: r.amount,
      date: r.payDate,
      time: r.payTime,
      category: r.category,
      paymentGateway: r.gatewayName,
      status: r.status,
    }));
    return data;
  }
}
