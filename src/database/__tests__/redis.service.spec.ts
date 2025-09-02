import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const mockRedisConfig = {
      host: 'localhost',
      port: 6379,
      password: undefined,
      db: 0,
      maxRetriesPerRequest: 3,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RedisService,
          useValue: {
            onModuleInit: jest.fn(),
            onModuleDestroy: jest.fn(),
            healthCheck: jest.fn(),
            getClient: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            exists: jest.fn(),
            hget: jest.fn(),
            hset: jest.fn(),
            hgetall: jest.fn(),
            expire: jest.fn(),
            flushdb: jest.fn(),
          },
        },
        {
          provide: 'REDIS_CONFIG',
          useValue: mockRedisConfig,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize Redis connection', async () => {
      await service.onModuleInit();
      expect(service.onModuleInit).toBeDefined();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from Redis', async () => {
      await service.onModuleDestroy();
      expect(service.onModuleDestroy).toBeDefined();
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      (service.healthCheck as jest.Mock).mockResolvedValue(true);

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });
  });

  describe('getClient', () => {
    it('should return Redis client', () => {
      (service.getClient as jest.Mock).mockReturnValue({});

      const result = service.getClient();

      expect(result).toBeDefined();
      expect(service.getClient).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get value by key', async () => {
      (service.get as jest.Mock).mockResolvedValue('test-value');

      const result = await service.get('test-key');

      expect(result).toBe('test-value');
      expect(service.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent key', async () => {
      (service.get as jest.Mock).mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
      expect(service.get).toHaveBeenCalledWith('non-existent');
    });

    it('should handle get errors', async () => {
      const error = new Error('Get failed');
      (service.get as jest.Mock).mockRejectedValue(error);

      await expect(service.get('test-key')).rejects.toThrow('Get failed');
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      (service.set as jest.Mock).mockResolvedValue(undefined);

      await service.set('test-key', 'test-value');

      expect(service.set).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should set value with TTL', async () => {
      (service.set as jest.Mock).mockResolvedValue(undefined);

      await service.set('test-key', 'test-value', 3600);

      expect(service.set).toHaveBeenCalledWith('test-key', 'test-value', 3600);
    });

    it('should handle set errors', async () => {
      const error = new Error('Set failed');
      (service.set as jest.Mock).mockRejectedValue(error);

      await expect(service.set('test-key', 'test-value')).rejects.toThrow('Set failed');
    });
  });

  describe('del', () => {
    it('should delete key and return count', async () => {
      (service.del as jest.Mock).mockResolvedValue(1);

      const result = await service.del('test-key');

      expect(result).toBe(1);
      expect(service.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      (service.del as jest.Mock).mockRejectedValue(error);

      await expect(service.del('test-key')).rejects.toThrow('Delete failed');
    });
  });

  describe('exists', () => {
    it('should return true if key exists', async () => {
      (service.exists as jest.Mock).mockResolvedValue(true);

      const result = await service.exists('test-key');

      expect(result).toBe(true);
      expect(service.exists).toHaveBeenCalledWith('test-key');
    });

    it('should return false if key does not exist', async () => {
      (service.exists as jest.Mock).mockResolvedValue(false);

      const result = await service.exists('non-existent');

      expect(result).toBe(false);
      expect(service.exists).toHaveBeenCalledWith('non-existent');
    });

    it('should handle exists errors', async () => {
      const error = new Error('Exists check failed');
      (service.exists as jest.Mock).mockRejectedValue(error);

      await expect(service.exists('test-key')).rejects.toThrow('Exists check failed');
    });
  });

  describe('hget', () => {
    it('should get hash field value', async () => {
      (service.hget as jest.Mock).mockResolvedValue('field-value');

      const result = await service.hget('hash-key', 'field');

      expect(result).toBe('field-value');
      expect(service.hget).toHaveBeenCalledWith('hash-key', 'field');
    });

    it('should handle hget errors', async () => {
      const error = new Error('Hget failed');
      (service.hget as jest.Mock).mockRejectedValue(error);

      await expect(service.hget('hash-key', 'field')).rejects.toThrow('Hget failed');
    });
  });

  describe('hset', () => {
    it('should set hash field value', async () => {
      (service.hset as jest.Mock).mockResolvedValue(undefined);

      await service.hset('hash-key', 'field', 'value');

      expect(service.hset).toHaveBeenCalledWith('hash-key', 'field', 'value');
    });

    it('should handle hset errors', async () => {
      const error = new Error('Hset failed');
      (service.hset as jest.Mock).mockRejectedValue(error);

      await expect(service.hset('hash-key', 'field', 'value')).rejects.toThrow('Hset failed');
    });
  });

  describe('hgetall', () => {
    it('should get all hash fields', async () => {
      const mockHash = { field1: 'value1', field2: 'value2' };
      (service.hgetall as jest.Mock).mockResolvedValue(mockHash);

      const result = await service.hgetall('hash-key');

      expect(result).toEqual(mockHash);
      expect(service.hgetall).toHaveBeenCalledWith('hash-key');
    });

    it('should handle hgetall errors', async () => {
      const error = new Error('Hgetall failed');
      (service.hgetall as jest.Mock).mockRejectedValue(error);

      await expect(service.hgetall('hash-key')).rejects.toThrow('Hgetall failed');
    });
  });

  describe('expire', () => {
    it('should set expiration and return true', async () => {
      (service.expire as jest.Mock).mockResolvedValue(true);

      const result = await service.expire('test-key', 3600);

      expect(result).toBe(true);
      expect(service.expire).toHaveBeenCalledWith('test-key', 3600);
    });

    it('should return false if key does not exist', async () => {
      (service.expire as jest.Mock).mockResolvedValue(false);

      const result = await service.expire('non-existent', 3600);

      expect(result).toBe(false);
      expect(service.expire).toHaveBeenCalledWith('non-existent', 3600);
    });

    it('should handle expire errors', async () => {
      const error = new Error('Expire failed');
      (service.expire as jest.Mock).mockRejectedValue(error);

      await expect(service.expire('test-key', 3600)).rejects.toThrow('Expire failed');
    });
  });

  describe('flushdb', () => {
    it('should flush database', async () => {
      (service.flushdb as jest.Mock).mockResolvedValue(undefined);

      await service.flushdb();

      expect(service.flushdb).toHaveBeenCalled();
    });

    it('should handle flushdb errors', async () => {
      const error = new Error('Flushdb failed');
      (service.flushdb as jest.Mock).mockRejectedValue(error);

      await expect(service.flushdb()).rejects.toThrow('Flushdb failed');
    });
  });
});
