import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CHAT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50051',
          package: 'chat.v1',
          protoPath: join(process.cwd(), 'protos/chat/v1/service.proto'),
          loader: {
            includeDirs: [join(process.cwd(), 'protos')],
          },
        },
      },
    ]),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
