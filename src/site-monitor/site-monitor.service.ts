import { Injectable } from '@nestjs/common';
import { fn } from 'objection';
import { ParkingSite } from 'src/core/orm/entities/parking-site.entity';
import { SiteConnectivity } from 'src/core/orm/entities/site-connectivity.entity';

const SITE_FIELDS = ['parking_site.id', 'parking_site.name'];
const CONNECTIVITY_FIELDS = ['site_id', 'status', 'connected_at', 'disconnected_at', 'last_seen_at'];

@Injectable()
export class SiteMonitorService {
  async siteExists(siteId: number): Promise<boolean> {
    const site = await ParkingSite.query().findById(siteId).select('id');
    return !!site;
  }

  async markOnline(siteId: number) {
    await SiteConnectivity.query()
      .insert({
        site_id: siteId,
        status: 'online',
        connected_at: fn.now(),
        last_seen_at: fn.now(),
        updated_at: fn.now(),
      } as any)
      .onConflict('site_id')
      .merge();
    return this.findOne(siteId);
  }

  async markOffline(siteId: number) {
    await SiteConnectivity.query()
      .patch({ status: 'offline', disconnected_at: fn.now(), updated_at: fn.now() } as any)
      .where('site_id', siteId);
    return this.findOne(siteId);
  }

  async touch(siteId: number) {
    await SiteConnectivity.query()
      .patch({ last_seen_at: fn.now() } as any)
      .where('site_id', siteId);
  }

  // Server restart pr koi socket zinda nahi — purani "online" rows galat hongi
  async markAllOffline() {
    await SiteConnectivity.query()
      .patch({ status: 'offline', disconnected_at: fn.now(), updated_at: fn.now() } as any)
      .where('status', 'online');
  }

  // siteConnectivity null = site kabhi connect nahi hui (portal pr offline dikhao)
  async findOne(siteId: number) {
    return ParkingSite.query()
      .findById(siteId)
      .select(SITE_FIELDS)
      .withGraphFetched('siteConnectivity')
      .modifyGraph('siteConnectivity', (qb) => qb.select(CONNECTIVITY_FIELDS));
  }

  // Portal screen ki pehli load — saari sites
  async list() {
    return ParkingSite.query()
      .select(SITE_FIELDS)
      .withGraphFetched('siteConnectivity')
      .modifyGraph('siteConnectivity', (qb) => qb.select(CONNECTIVITY_FIELDS))
      .orderBy('parking_site.name', 'asc');
  }
}
