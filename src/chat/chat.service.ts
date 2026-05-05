import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, tap } from 'rxjs';
import {
  ChatMessageRequest,
  ChatChunkResponse,
} from 'src/genproto/chat/v1/message';
import { ChatServiceClient } from 'src/genproto/chat/v1/service';

@Injectable()
export class ChatService implements OnModuleInit {
  private chatService: ChatServiceClient;

  constructor(@Inject('CHAT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.chatService = this.client.getService<ChatServiceClient>('ChatService');
  }

  streamChat(
    upstream: Observable<ChatMessageRequest>,
  ): Observable<ChatChunkResponse> {
    return this.chatService
      .chatStream(upstream)
      .pipe(tap((val) => console.log('RAW GRPC DATA:', val)));
  }
}
