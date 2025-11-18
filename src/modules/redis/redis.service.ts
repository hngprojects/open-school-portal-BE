import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis as redis_client } from 'ioredis';

@Injectable()
export class RedisService extends redis_client implements OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super(configService.get<string>('REDIS_URL'));
  }

  onModuleDestroy() {
    this.quit();
  }
}
