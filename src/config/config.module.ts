import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { EnvService } from './env.service';

@Module({
  providers: [EnvService, ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
