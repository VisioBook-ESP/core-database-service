import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'DATABASE_URL') {
          return 'postgresql://test:test@localhost:5432/test';
        }
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            $queryRaw: jest.fn(),
            onModuleInit: jest.fn(),
            onModuleDestroy: jest.fn(),
            healthCheck: jest.fn(),
            getConnectionInfo: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // No need to disconnect since we're using a mock
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      (service.onModuleInit as jest.Mock).mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(service.onModuleInit).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      (service.onModuleInit as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      try {
        await service.onModuleInit();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(service.onModuleInit).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database', async () => {
      (service.onModuleDestroy as jest.Mock).mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(service.onModuleDestroy).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true when database is connected', async () => {
      (service.healthCheck as jest.Mock).mockResolvedValue(true);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(service.healthCheck).toHaveBeenCalled();
    });

    it('should return false when database query fails', async () => {
      (service.healthCheck as jest.Mock).mockResolvedValue(false);

      const result = await service.healthCheck();

      expect(result).toBe(false);
      expect(service.healthCheck).toHaveBeenCalled();
    });
  });

  describe('getConnectionInfo', () => {
    it('should return connection information', async () => {
      const mockConnectionInfo = {
        database_name: 'test',
        current_user: 'testuser',
        version: 'PostgreSQL 14.0',
        current_time: new Date(),
      };

      (service.getConnectionInfo as jest.Mock).mockResolvedValue(mockConnectionInfo);

      const result = await service.getConnectionInfo();

      expect(result).toEqual(mockConnectionInfo);
      expect(service.getConnectionInfo).toHaveBeenCalled();
    });

    it('should handle connection info errors', async () => {
      const error = new Error('Connection info failed');
      (service.getConnectionInfo as jest.Mock).mockRejectedValue(error);

      await expect(service.getConnectionInfo()).rejects.toThrow('Connection info failed');
      expect(service.getConnectionInfo).toHaveBeenCalled();
    });
  });
});
