import { Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import { CorporateBillingPlan } from 'src/core/orm/entities/corporate-billing-plan.entity';
import { CorporateCards } from 'src/core/orm/entities/corporate-cards.entity';
import { CorporateInvoice } from 'src/core/orm/entities/corporate-invoice.entity';
import { CorporateResetPassword } from 'src/core/orm/entities/corporate-reset-password.entity';
import { Corporate } from 'src/core/orm/entities/corporate.entity';
import { PortalNotification } from 'src/core/orm/entities/portal-notification.entity';

@Injectable()
export class CorporatesService {
  async findOne(id: number) {
    const corporate = await Corporate.query().findById(id);
    if (!corporate) {
      AppException.notFound({ message: `Corporate #${id} not found` });
    }
    return corporate;
  }

  async delete(id: number) {
    // 1. Check if Corporate exists
    const corporate: any = await Corporate.query().findById(id);
    if (!corporate) {
      AppException.notFound({ message: `Corporate #${id} not found` });
    }

    // 2. Validate status is 'pending'
    const currentStatus = (
      corporate.status ||
      corporate.statusCorporate ||
      ''
    ).toLowerCase();

    if (currentStatus !== 'pending') {
      AppException.badRequest({
        message: `Only corporates with 'pending' status can be deleted. Current status is '${corporate.status || corporate.statusCorporate}'.`,
      });
    }

    // 3. Delete corporate and its related child records inside an atomic transaction
    await Corporate.transaction(async (trx) => {
      // Delete password reset OTPs
      await CorporateResetPassword.query()
        .transacting(trx)
        .where('corporate', id)
        .delete();

      // Delete portal notifications
      await PortalNotification.query()
        .transacting(trx)
        .where('corporateId', id)
        .delete();

      // Delete corporate cards
      await CorporateCards.query()
        .transacting(trx)
        .where('corporate', id)
        .delete();

      // Delete billing plans
      await CorporateBillingPlan.query()
        .transacting(trx)
        .where('corporateId', id)
        .delete();

      // Delete corporate invoices
      await CorporateInvoice.query()
        .transacting(trx)
        .where('corporateId', id)
        .delete();

      // Delete the Corporate record itself
      await Corporate.query().transacting(trx).deleteById(id);
    });

    return { id, deleted: true };
  }
}
