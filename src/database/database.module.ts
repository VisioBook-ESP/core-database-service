import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    PrismaService,
    RedisService,
    {
      provide: 'DATABASE_CONFIG',
      useFactory: (
        configService: ConfigService,
      ): {
        databaseUrl: string;
        maxConnections: number;
        connectionTimeout: number;
      } => ({
        databaseUrl: configService.get('DATABASE_URL') ?? '',
        maxConnections: configService.get('DB_MAX_CONNECTIONS', 10),
        connectionTimeout: configService.get('DB_CONNECTION_TIMEOUT', 30000),
      }),
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_CONFIG',
      useFactory: (
        configService: ConfigService,
      ): {
        host: string;
        port: number;
        password?: string;
        db: number;
        maxRetriesPerRequest: number;
      } => ({
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        maxRetriesPerRequest: 3,
      }),
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService, RedisService],
})
export class DatabaseModule {}
