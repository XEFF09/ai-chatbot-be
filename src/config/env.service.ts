import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvService {
  get(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`❌ Missing required environment variable: ${key}`);
    }
    return value;
  }

  getNumber(key: string): number {
    return parseInt(this.get(key), 10);
  }

  getOptional(key: string, defaultValue?: string): string {
    return process.env[key] ?? defaultValue ?? '';
  }
}
