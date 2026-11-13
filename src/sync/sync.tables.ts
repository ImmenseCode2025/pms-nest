import { Corporate } from 'src/core/orm/entities/corporate.entity';

export interface SyncTable {
  model: { query: () => any };
  fields: string[]; // pehla field hamesha 'id'
}

export const SYNC_TABLES: Record<string, SyncTable> = {
  corporates: {
    model: Corporate,
    fields: ['id', 'name', 'status'],
  },
};
