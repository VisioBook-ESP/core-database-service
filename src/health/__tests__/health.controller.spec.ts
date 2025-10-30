import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { HealthService, HealthStatus } from '../health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: jest.Mocked<HealthService>;

  beforeEach(async () => {
    const mockHealthService = {
      getHealthStatus: jest.fn(),
      getReadinessStatus: jest.fn(),
      getLivenessStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      // Arrange
      const mockHealthStatus: HealthStatus = {
        status: 'healthy',
        timestamp: '2023-01-01T00:00:00.000Z',
        version: '1.0.0',
        uptime: 1000,
        environment: 'test',
        services: {
          database: 'connected',
          redis: 'connected',
        },
      };
      healthService.getHealthStatus.mockResolvedValue(mockHealthStatus);

      // Act
      const result = await controller.getHealth();

      // Assert
      expect(result).toEqual(mockHealthStatus);
      expect(healthService.getHealthStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status', async () => {
      // Arrange
      const mockReadinessStatus = {
        ready: true,
        checks: {
          database: true,
          redis: true,
        },
      };
      healthService.getReadinessStatus.mockResolvedValue(mockReadinessStatus);

      // Act
      const result = await controller.getReadiness();

      // Assert
      expect(result).toEqual(mockReadinessStatus);
      expect(healthService.getReadinessStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLiveness', () => {
    it('should return liveness status', () => {
      // Arrange
      const mockLivenessStatus = { alive: true };
      healthService.getLivenessStatus.mockReturnValue(mockLivenessStatus);

      // Act
      const result = controller.getLiveness();

      // Assert
      expect(result).toEqual(mockLivenessStatus);
      expect(healthService.getLivenessStatus).toHaveBeenCalledTimes(1);
    });
  });
});
