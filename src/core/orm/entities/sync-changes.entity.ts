import { Mapping } from '../sql.model';

export class SyncChanges extends Mapping {
  static get tableName() {
    return 'sync_changes';
  }

  id?: number;
  table_name?: string;
  record_id?: number;
  action?: 'insert' | 'update' | 'delete';
  created_at?: Date | string;
}
