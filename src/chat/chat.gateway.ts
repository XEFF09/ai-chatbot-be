import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Subject } from 'rxjs';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from 'src/auth/auth.guard';
import { SocketAuthMiddleware } from 'src/auth/strategies/socket.strategy';
import { ChatService } from './chat.service';
import { ChatMessageRequestDTO } from './dto/chat-message';

@UseGuards(JwtAuthGuard, RolesGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  private sessions = new Map<string, Subject<any>>();
  constructor(private readonly grpcService: ChatService) {}

  @WebSocketServer()
  server: Server;

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatMessageRequestDTO,
  ) {
    let upstream = this.sessions.get(client.id);

    if (!upstream) {
      upstream = new Subject<any>();
      this.sessions.set(client.id, upstream);

      const downstream = this.grpcService.streamChat(upstream.asObservable());

      downstream.subscribe({
        next: (chunk) => {
          client.emit('chatChunk', chunk);
        },
        error: (err) => {
          client.emit('error', `AI Service Error ${err}`);
          this.sessions.delete(client.id);
        },
        complete: () => {
          client.emit('chatComplete');
          this.sessions.delete(client.id);
        },
      });
    }

    upstream.next({
      user_id: data.userId,
      message: data.message,
      agent: data.agent,
      timestamp: Date.now(),
    });
  }

  handleDisconnect(client: Socket) {
    const upstream = this.sessions.get(client.id);
    if (upstream) {
      upstream.complete();
      this.sessions.delete(client.id);
    }
  }
}
