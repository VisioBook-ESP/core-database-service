import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetriesPerRequest: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(@Inject('REDIS_CONFIG') private readonly config: RedisConfig) {}

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
        maxRetriesPerRequest: this.config.maxRetriesPerRequest,
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.logger.log('✅ Connected to Redis');
      });

      this.client.on('error', (error) => {
        this.logger.error('❌ Redis connection error:', error);
      });

      this.client.on('close', () => {
        this.logger.warn('🔌 Redis connection closed');
      });

      this.client.on('reconnecting', () => {
        this.logger.log('🔄 Reconnecting to Redis...');
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.client) {
        await this.client.quit();
        this.logger.log('🔌 Disconnected from Redis');
      }
    } catch (error) {
      this.logger.error('❌ Error disconnecting from Redis:', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      throw error;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Failed to get hash field ${field} from ${key}:`, error);
      throw error;
    }
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hset(key, field, value);
    } catch (error) {
      this.logger.error(`Failed to set hash field ${field} in ${key}:`, error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Failed to get all hash fields from ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to set expiration for key ${key}:`, error);
      throw error;
    }
  }

  async flushdb(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      this.logger.error('Failed to flush database:', error);
      throw error;
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
