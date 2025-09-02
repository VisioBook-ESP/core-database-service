import { Test, TestingModule } from '@nestjs/testing';
import { RedisService, RedisConfig } from '../redis.service';

describe('RedisService Integration', () => {
  let service: RedisService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockRedisConfig: RedisConfig = {
      host: 'localhost',
      port: 6379,
      password: undefined,
      db: 0,
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
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have constructor with proper configuration', () => {
    expect(service).toBeDefined();
    expect(typeof service.onModuleInit).toBe('function');
    expect(typeof service.onModuleDestroy).toBe('function');
    expect(typeof service.healthCheck).toBe('function');
    expect(typeof service.getClient).toBe('function');
  });

  it('should handle onModuleInit gracefully', async () => {
    // Mock Redis client methods to avoid actual Redis connection
    const mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
    };

    // Set the client property directly to avoid constructor issues
    (service as any).client = mockClient;

    await expect(service.onModuleInit()).resolves.not.toThrow();
  });

  it('should handle onModuleDestroy gracefully', async () => {
    const mockClient = {
      quit: jest.fn().mockResolvedValue('OK'),
    };

    // Set the client property
    (service as any).client = mockClient;

    await expect(service.onModuleDestroy()).resolves.not.toThrow();
  });

  it('should handle onModuleDestroy errors gracefully', async () => {
    const mockClient = {
      quit: jest.fn().mockRejectedValue(new Error('Quit failed')),
    };

    (service as any).client = mockClient;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(service.onModuleDestroy()).resolves.not.toThrow();

    consoleSpy.mockRestore();
  });

  it('should return true for successful health check', async () => {
    const mockClient = {
      ping: jest.fn().mockResolvedValue('PONG'),
    };

    (service as any).client = mockClient;

    const result = await service.healthCheck();

    expect(result).toBe(true);
  });

  it('should return false for failed health check', async () => {
    const mockClient = {
      ping: jest.fn().mockRejectedValue(new Error('Ping failed')),
    };

    (service as any).client = mockClient;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await service.healthCheck();

    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });

  it('should get value successfully', async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue('test-value'),
    };

    (service as any).client = mockClient;

    const result = await service.get('test-key');

    expect(result).toBe('test-value');
    expect(mockClient.get).toHaveBeenCalledWith('test-key');
  });

  it('should handle get errors', async () => {
    const mockClient = {
      get: jest.fn().mockRejectedValue(new Error('Get failed')),
    };

    (service as any).client = mockClient;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(service.get('test-key')).rejects.toThrow('Get failed');

    consoleSpy.mockRestore();
  });

  it('should set value without TTL', async () => {
    const mockClient = {
      set: jest.fn().mockResolvedValue('OK'),
    };

    (service as any).client = mockClient;

    await expect(service.set('test-key', 'test-value')).resolves.not.toThrow();

    expect(mockClient.set).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('should set value with TTL', async () => {
    const mockClient = {
      setex: jest.fn().mockResolvedValue('OK'),
    };

    (service as any).client = mockClient;

    await expect(service.set('test-key', 'test-value', 3600)).resolves.not.toThrow();

    expect(mockClient.setex).toHaveBeenCalledWith('test-key', 3600, 'test-value');
  });

  it('should handle set errors', async () => {
    const mockClient = {
      set: jest.fn().mockRejectedValue(new Error('Set failed')),
    };

    (service as any).client = mockClient;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(service.set('test-key', 'test-value')).rejects.toThrow('Set failed');

    consoleSpy.mockRestore();
  });

  it('should delete key successfully', async () => {
    const mockClient = {
      del: jest.fn().mockResolvedValue(1),
    };

    (service as any).client = mockClient;

    const result = await service.del('test-key');

    expect(result).toBe(1);
    expect(mockClient.del).toHaveBeenCalledWith('test-key');
  });

  it('should check key existence', async () => {
    const mockClient = {
      exists: jest.fn().mockResolvedValue(1),
    };

    (service as any).client = mockClient;

    const result = await service.exists('test-key');

    expect(result).toBe(true);
    expect(mockClient.exists).toHaveBeenCalledWith('test-key');
  });

  it('should get hash field', async () => {
    const mockClient = {
      hget: jest.fn().mockResolvedValue('field-value'),
    };

    (service as any).client = mockClient;

    const result = await service.hget('hash-key', 'field');

    expect(result).toBe('field-value');
    expect(mockClient.hget).toHaveBeenCalledWith('hash-key', 'field');
  });

  it('should set hash field', async () => {
    const mockClient = {
      hset: jest.fn().mockResolvedValue(1),
    };

    (service as any).client = mockClient;

    await expect(service.hset('hash-key', 'field', 'value')).resolves.not.toThrow();

    expect(mockClient.hset).toHaveBeenCalledWith('hash-key', 'field', 'value');
  });

  it('should get all hash fields', async () => {
    const mockHash = { field1: 'value1', field2: 'value2' };
    const mockClient = {
      hgetall: jest.fn().mockResolvedValue(mockHash),
    };

    (service as any).client = mockClient;

    const result = await service.hgetall('hash-key');

    expect(result).toEqual(mockHash);
    expect(mockClient.hgetall).toHaveBeenCalledWith('hash-key');
  });

  it('should set expiration successfully', async () => {
    const mockClient = {
      expire: jest.fn().mockResolvedValue(1),
    };

    (service as any).client = mockClient;

    const result = await service.expire('test-key', 3600);

    expect(result).toBe(true);
    expect(mockClient.expire).toHaveBeenCalledWith('test-key', 3600);
  });

  it('should flush database successfully', async () => {
    const mockClient = {
      flushdb: jest.fn().mockResolvedValue('OK'),
    };

    (service as any).client = mockClient;

    await expect(service.flushdb()).resolves.not.toThrow();

    expect(mockClient.flushdb).toHaveBeenCalled();
  });

  it('should return Redis client', () => {
    const mockClient = { test: 'client' };
    (service as any).client = mockClient;

    const result = service.getClient();

    expect(result).toBe(mockClient);
  });
});
