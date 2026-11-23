import { Injectable } from '@nestjs/common';
import { LodashHelper } from 'src/core/helper/lodash-helper';
import { ParkingSite } from 'src/core/orm/entities/parking-site.entity';
import { PosDeviceLogs } from 'src/core/orm/entities/pos-device-logs.entity';
import { Users } from 'src/core/orm/entities/users.entity';

const FIELD_LABELS: Record<string, string> = {
  serial_number: 'serial number',
  bank: 'bank',
  site_id: 'site',
};

@Injectable()
export class PosDeviceLogsHelper {
  async logCreated(device: any, authId: number) {
    const username = await this.username(authId);
    const siteName = await this.siteName(device.site_id);
    await PosDeviceLogs.query().insertAndFetch({
      pos_device_id: device.id,
      user_id: authId,
      action: 'created',
      field: 'site_id',
      old_value: null,
      new_value: device.site_id ? String(device.site_id) : null,
      description: `[[${username}]] added POS device ${device.serial_number} and assigned it to ${siteName}.`,
    });
  }

  async logUpdated(before: any, after: any, authId: number) {
    const username = await this.username(authId);

    for (const field of Object.keys(FIELD_LABELS)) {
      const oldVal = before[field];
      const newVal = after[field];
      if (String(oldVal ?? '') === String(newVal ?? '')) continue;

      let action: 'assigned' | 'updated';
      let description: string;
      if (field === 'site_id') {
        action = 'assigned';
        description = `[[${username}]] assigned POS device ${after.serial_number} from ${await this.siteName(oldVal)} to ${await this.siteName(newVal)}.`;
      } else {
        action = 'updated';
        description = `[[${username}]] changed ${FIELD_LABELS[field]} from ${this.display(oldVal)} to ${this.display(newVal)}.`;
      }

      await PosDeviceLogs.query().insertAndFetch({
        pos_device_id: before.id,
        user_id: authId,
        action,
        field,
        old_value: oldVal == null ? null : String(oldVal),
        new_value: newVal == null ? null : String(newVal),
        description,
      });
    }
  }

  async logDeleted(device: any, authId: number) {
    const username = await this.username(authId);
    await PosDeviceLogs.query().insertAndFetch({
      pos_device_id: device.id,
      user_id: authId,
      action: 'deleted',
      description: `[[${username}]] deleted POS device ${device.serial_number}.`,
    });
  }

  private async username(authId: number) {
    const user: any = authId
      ? await Users.query().findById(authId).select('username')
      : null;
    return user?.username || 'Unknown user';
  }

  private async siteName(siteId: number) {
    if (!siteId) return 'N/A';
    const site: any = await ParkingSite.query().findById(siteId).select('name');
    return site?.name || `site #${siteId}`;
  }

  private display(val: any) {
    return LodashHelper.isNil(val) || val === ''
      ? 'N/A'
      : String(val);
  }
}
