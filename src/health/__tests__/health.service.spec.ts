import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthService } from '../health.service';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockPrismaService = {
      healthCheck: jest.fn(),
    };

    const mockRedisService = {
      healthCheck: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when all services are connected', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      redisService.healthCheck.mockResolvedValue(true);
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        switch (key) {
          case 'npm_package_version':
            return '1.0.0';
          case 'NODE_ENV':
            return 'test';
          default:
            return defaultValue;
        }
      });

      // Act
      const result = await service.getHealthStatus();

      // Assert
      expect(result.status).toBe('healthy');
      expect(result.services.database).toBe('connected');
      expect(result.services.redis).toBe('connected');
      expect(result.version).toBe('1.0.0');
      expect(result.environment).toBe('test');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy status when database is disconnected', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(false);
      redisService.healthCheck.mockResolvedValue(true);
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        switch (key) {
          case 'npm_package_version':
            return '1.0.0';
          case 'NODE_ENV':
            return 'test';
          default:
            return defaultValue;
        }
      });

      // Act
      const result = await service.getHealthStatus();

      // Assert
      expect(result.status).toBe('unhealthy');
      expect(result.services.database).toBe('disconnected');
      expect(result.services.redis).toBe('connected');
    });

    it('should return unhealthy status when redis is disconnected', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      redisService.healthCheck.mockResolvedValue(false);
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        switch (key) {
          case 'npm_package_version':
            return '1.0.0';
          case 'NODE_ENV':
            return 'test';
          default:
            return defaultValue;
        }
      });

      // Act
      const result = await service.getHealthStatus();

      // Assert
      expect(result.status).toBe('unhealthy');
      expect(result.services.database).toBe('connected');
      expect(result.services.redis).toBe('disconnected');
    });

    it('should handle database health check errors', async () => {
      // Arrange
      prismaService.healthCheck.mockRejectedValue(new Error('Database error'));
      redisService.healthCheck.mockResolvedValue(true);
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        switch (key) {
          case 'npm_package_version':
            return '1.0.0';
          case 'NODE_ENV':
            return 'test';
          default:
            return defaultValue;
        }
      });

      // Act
      const result = await service.getHealthStatus();

      // Assert
      expect(result.status).toBe('unhealthy');
      expect(result.services.database).toBe('disconnected');
      expect(result.services.redis).toBe('connected');
    });
  });

  describe('getReadinessStatus', () => {
    it('should return ready when all services are healthy', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      redisService.healthCheck.mockResolvedValue(true);

      // Act
      const result = await service.getReadinessStatus();

      // Assert
      expect(result.ready).toBe(true);
      expect(result.checks.database).toBe(true);
      expect(result.checks.redis).toBe(true);
    });

    it('should return not ready when database is unhealthy', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(false);
      redisService.healthCheck.mockResolvedValue(true);

      // Act
      const result = await service.getReadinessStatus();

      // Assert
      expect(result.ready).toBe(false);
      expect(result.checks.database).toBe(false);
      expect(result.checks.redis).toBe(true);
    });

    it('should return not ready when redis is unhealthy', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      redisService.healthCheck.mockResolvedValue(false);

      // Act
      const result = await service.getReadinessStatus();

      // Assert
      expect(result.ready).toBe(false);
      expect(result.checks.database).toBe(true);
      expect(result.checks.redis).toBe(false);
    });
  });

  describe('getLivenessStatus', () => {
    it('should always return alive', () => {
      // Act
      const result = service.getLivenessStatus();

      // Assert
      expect(result.alive).toBe(true);
    });
  });
});
