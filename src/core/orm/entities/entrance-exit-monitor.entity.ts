import { Mapping } from 'src/core/orm/sql.model';

export class EntranceExitMonitor extends Mapping {
  static table = 'entrance_exit_monitor';

  userId?: number;
  parkingTokenId?: number;
  hardwareId?: number;
  screenShot?: string;
  registrationNo?: string;
  captureDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
