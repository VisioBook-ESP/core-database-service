import { Test, TestingModule } from '@nestjs/testing';
import { RedisService, RedisConfig } from '../redis.service';

describe('RedisService Integration', () => {
  let service: RedisService;
  let module: TestingModule;

  beforeEach(async () => {
    // Use a separate database index for integration tests to avoid conflicts
    const mockRedisConfig: RedisConfig = {
      host: 'localhost',
      port: 6379,
      password: undefined,
      db: 15, // Use db 15 for tests to isolate from development data
      maxRetriesPerRequest: 3,
    };

    module = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CONFIG',
          useValue: mockRedisConfig,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    // Clean up test data
    try {
      if (service) {
        await service.flushdb();
        await service.onModuleDestroy();
      }
    } catch {
      // Ignore cleanup errors
    }

    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Connection Lifecycle', () => {
    it('should connect to real Redis instance', async () => {
      await expect(service.onModuleInit()).resolves.not.toThrow();
      expect(service.getClient()).toBeDefined();
    });

    it('should perform health check successfully', async () => {
      await service.onModuleInit();

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });

    it('should disconnect gracefully', async () => {
      await service.onModuleInit();

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  describe('Basic Operations with Real Redis', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should set and get value successfully', async () => {
      const testKey = 'integration-test-key';
      const testValue = 'integration-test-value';

      await service.set(testKey, testValue);
      const result = await service.get(testKey);

      expect(result).toBe(testValue);
    });

    it('should set value with TTL and retrieve it', async () => {
      const testKey = 'integration-test-ttl-key';
      const testValue = 'integration-test-ttl-value';

      await service.set(testKey, testValue, 60); // 60 seconds TTL
      const result = await service.get(testKey);

      expect(result).toBe(testValue);
    });

    it('should handle key existence checks', async () => {
      const testKey = 'integration-test-exists-key';

      // Key should not exist initially
      let exists = await service.exists(testKey);
      expect(exists).toBe(false);

      // Set the key
      await service.set(testKey, 'value');

      // Key should now exist
      exists = await service.exists(testKey);
      expect(exists).toBe(true);
    });

    it('should delete keys successfully', async () => {
      const testKey = 'integration-test-del-key';

      await service.set(testKey, 'value');
      const deleteCount = await service.del(testKey);

      expect(deleteCount).toBe(1);

      const exists = await service.exists(testKey);
      expect(exists).toBe(false);
    });
  });

  describe('Hash Operations with Real Redis', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should set and get hash fields', async () => {
      const hashKey = 'integration-test-hash';
      const field = 'field1';
      const value = 'value1';

      await service.hset(hashKey, field, value);
      const result = await service.hget(hashKey, field);

      expect(result).toBe(value);
    });

    it('should get all hash fields', async () => {
      const hashKey = 'integration-test-hash-all';

      await service.hset(hashKey, 'field1', 'value1');
      await service.hset(hashKey, 'field2', 'value2');

      const result = await service.hgetall(hashKey);

      expect(result).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });
  });

  describe('Expiration with Real Redis', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should set expiration on existing key', async () => {
      const testKey = 'integration-test-expire-key';

      await service.set(testKey, 'value');
      const result = await service.expire(testKey, 60);

      expect(result).toBe(true);
    });

    it('should return false when setting expiration on non-existent key', async () => {
      const result = await service.expire('non-existent-key', 60);

      expect(result).toBe(false);
    });
  });
});
