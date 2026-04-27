import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { ConfigService as AppConfigService } from './config/config.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: ({ database }: AppConfigService) => ({
        uri: database.uri,
        user: database.username,
        pass: database.password,
        dbName: database.name,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
