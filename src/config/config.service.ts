import { Injectable } from '@nestjs/common';
import { DatabaseConfig } from './entities/database';
import { EnvService } from './env.service';

@Injectable()
export class ConfigService {
  constructor(private readonly env: EnvService) {}

  get database(): DatabaseConfig {
    return {
      host: this.env.get('DB_HOST'),
      port: this.env.getNumber('DB_PORT'),
      name: this.env.get('DB_DATABASE'),
      username: this.env.get('DB_USERNAME'),
      password: this.env.get('DB_PASSWORD'),
      uri: `mongodb://${this.env.get('DB_HOST')}:${this.env.getNumber('DB_PORT')}`,
    };
  }

  get jwtSecret(): string {
    return this.env.get('JWT_SECRET');
  }
}
