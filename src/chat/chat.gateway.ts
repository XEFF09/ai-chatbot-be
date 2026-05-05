import { ChatService } from './chat.service';
import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatMessageRequestDTO } from './dto/chat-message';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard, RolesGuard } from 'src/auth/auth.guard';
import { SocketAuthMiddleware } from 'src/auth/strategies/socket.strategy';

@UseGuards(JwtAuthGuard, RolesGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnModuleInit {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
    });
  }

  @SubscribeMessage('chatMessage')
  OnNewMessage(@MessageBody() req: ChatMessageRequestDTO) {
    console.log('Received message:', req.message);
    this.server.emit('onMessage', `received: ${req.message}`);
  }
}
