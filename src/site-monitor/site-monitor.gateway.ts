import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { SiteMonitorService } from './site-monitor.service';

// Internet thori der k liye jaye to status bar bar flip na ho
const OFFLINE_GRACE_MS = 20_000;
const VIEWERS_ROOM = 'site-monitor-viewers';
const siteRoom = (siteId: number) => `site-${siteId}`;

/**
 * Desktop app (site server):  connect with  auth: { site_id }  (ya query ?site_id=)
 * Admin portal:              site_id k baghair connect -> 'site-status' event sunta hai
 */
@WebSocketGateway({
  namespace: 'site-monitor',
  cors: '*',
  transports: ['websocket'],
})
export class SiteMonitorGateway implements OnGatewayConnection, OnGatewayDisconnect, OnApplicationBootstrap {
  @WebSocketServer() server: Namespace;

  private readonly logger = new Logger(SiteMonitorGateway.name);
  private readonly offlineTimers = new Map<number, NodeJS.Timeout>();

  constructor(private readonly siteMonitorService: SiteMonitorService) {}

  async onApplicationBootstrap() {
    await this.siteMonitorService.markAllOffline();
  }

  async handleConnection(socket: Socket) {
    const raw = socket.handshake.auth?.site_id ?? socket.handshake.query?.site_id;

    // site_id nahi = portal viewer
    if (raw === undefined || raw === null || raw === '') {
      socket.join(VIEWERS_ROOM);
      return;
    }

    const siteId = Number(raw);
    if (!Number.isInteger(siteId) || !(await this.siteMonitorService.siteExists(siteId))) {
      socket.emit('site-rejected', { message: 'Invalid site_id' });
      socket.disconnect(true);
      return;
    }

    socket.data.siteId = siteId;
    socket.join(siteRoom(siteId));
    this.clearOfflineTimer(siteId);

    const status = await this.siteMonitorService.markOnline(siteId);
    this.server.to(VIEWERS_ROOM).emit('site-status', status);
    this.logger.log(`Site ${siteId} online`);
  }

  async handleDisconnect(socket: Socket) {
    const siteId: number | undefined = socket.data.siteId;
    if (!siteId) return;

    this.clearOfflineTimer(siteId);
    const timer = setTimeout(async () => {
      this.offlineTimers.delete(siteId);
      try {
        // Usi site ka koi aur socket abhi bhi connected hai (reconnect ho gaya) — offline mat karo
        const sockets = await this.server.in(siteRoom(siteId)).fetchSockets();
        if (sockets.length) return;

        const status = await this.siteMonitorService.markOffline(siteId);
        this.server.to(VIEWERS_ROOM).emit('site-status', status);
        this.logger.warn(`Site ${siteId} offline`);
      } catch (error) {
        this.logger.error(`Site ${siteId} offline mark failed`, error?.stack);
      }
    }, OFFLINE_GRACE_MS);
    this.offlineTimers.set(siteId, timer);
  }

  // Optional — desktop app har 30s bheje to last_seen_at update hota rahega
  @SubscribeMessage('heartbeat')
  async heartbeat(@ConnectedSocket() socket: Socket) {
    const siteId: number | undefined = socket.data.siteId;
    if (siteId) await this.siteMonitorService.touch(siteId);
  }

  private clearOfflineTimer(siteId: number) {
    const timer = this.offlineTimers.get(siteId);
    if (timer) {
      clearTimeout(timer);
      this.offlineTimers.delete(siteId);
    }
  }
}
