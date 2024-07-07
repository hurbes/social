import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter, RedisAdapter } from '@socket.io/redis-adapter';
import {
  createClient,
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from 'redis';

import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  protected redisAdapter: (nsp: any) => RedisAdapter;
  protected pubClient: RedisClientType<
    RedisDefaultModules & RedisModules,
    RedisFunctions,
    RedisScripts
  >;
  protected subClient: RedisClientType<
    RedisDefaultModules & RedisModules,
    RedisFunctions,
    RedisScripts
  >;

  constructor(app: INestApplication) {
    super(app);
    const configService = app.get(ConfigService);

    this.pubClient = createClient({
      url: configService.get('REDIS_URI'),
      password: configService.get('REDIS_PASS'),
      socket: {
        host: configService.get('REDIS_URI'),
      },
    });
    this.subClient = this.pubClient.duplicate();
  }

  async connectToRedis() {
    await this.pubClient.connect();
    await this.subClient.connect();

    this.redisAdapter = createAdapter(this.pubClient, this.subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;

    server.adapter(this.redisAdapter);

    return server;
  }
}
