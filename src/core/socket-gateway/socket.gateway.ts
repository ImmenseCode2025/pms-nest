import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GlobalHelper } from '../helper/global-helper';
import { Users } from '../orm/entities/users.entity';
import { InboxTypingDto } from './dto/socket.dto';

@WebSocketGateway({
  namespace: 'socket',
  cors: '*',
  transports: ['websocket'],
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  async handleConnection(socket: Socket, ...args: any[]) {
    const { authid } = socket?.handshake?.headers;
    if (authid) {
      const userId = await GlobalHelper.changeUserStatus(authid, 1);
      return this.server.emit('user-connected', userId);
    }
  }

  async handleDisconnect(socket: Socket) {
    const { authid } = socket?.handshake?.headers;
    if (authid) {
      const userId = await GlobalHelper.changeUserStatus(authid, 0);
      return this.server.emit('user-dis-connected', userId);
    }
  }

  // -->> chat <<--- //
  async receivedMessage({ receiverId, data }) {
    return this.server.emit(`message-receiver-${receiverId}`, data);
  }

  async seenAllMessage({ inboxId }) {
    return this.server.emit(`seen-inbox-${inboxId}`, inboxId);
  }

  async deleteForEveryOne({ inboxId, messageId }): Promise<any> {
    return this.server.emit(`message-delete-everyone-${inboxId}`, messageId);
  }

  async receivedCruiseMessage({ cruiseId, data }) {
    return this.server.emit(`cruise-message-receiver-${cruiseId}`, data);
  }

  @SubscribeMessage('typing')
  async typing(@MessageBody() dto: InboxTypingDto) {
    let findOne: any = await Users.query().findById(dto.user_id);
    return this.server.emit(`typing-${dto.inbox_id}`, findOne);
  }
}
