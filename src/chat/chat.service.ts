import { Injectable } from '@nestjs/common';
import { ChatMessageRequestDTO } from './dto/chat-message';

@Injectable()
export class ChatService {
  stream(req: ChatMessageRequestDTO) {
    return `i got this message and going to send to grpc: ${req.message}`;
  }
}
