import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

describe('PrismaService Integration', () => {
  let service: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'DATABASE_URL':
            return 'postgresql://test:test@localhost:5432/test';
          case 'NODE_ENV':
            return 'test';
          default:
            return undefined;
        }
      }),
    };

    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
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
    expect(typeof service.getConnectionInfo).toBe('function');
  });

  it('should handle onModuleInit gracefully', async () => {
    // Mock the $connect method to avoid actual database connection
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await expect(service.onModuleInit()).resolves.not.toThrow();

    connectSpy.mockRestore();
  });

  it('should handle onModuleInit connection errors', async () => {
    const connectSpy = jest.spyOn(service, '$connect').mockRejectedValue(new Error('Connection failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(service.onModuleInit()).rejects.toThrow('Connection failed');

    connectSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should handle onModuleDestroy gracefully', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue();

    await expect(service.onModuleDestroy()).resolves.not.toThrow();

    disconnectSpy.mockRestore();
  });

  it('should handle onModuleDestroy errors gracefully', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockRejectedValue(new Error('Disconnect failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(service.onModuleDestroy()).resolves.not.toThrow();

    disconnectSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should return true for successful health check', async () => {
    const queryRawSpy = jest.spyOn(service, '$queryRaw').mockResolvedValue([{ result: 1 }]);

    const result = await service.healthCheck();

    expect(result).toBe(true);
    queryRawSpy.mockRestore();
  });

  it('should return false for failed health check', async () => {
    const queryRawSpy = jest.spyOn(service, '$queryRaw').mockRejectedValue(new Error('Query failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await service.healthCheck();

    expect(result).toBe(false);
    queryRawSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should return connection info successfully', async () => {
    const mockConnectionInfo = [
      {
        database_name: 'test',
        current_user: 'testuser',
        version: 'PostgreSQL 14.0',
        current_time: new Date(),
      },
    ];

    const queryRawSpy = jest.spyOn(service, '$queryRaw').mockResolvedValue(mockConnectionInfo);

    const result = await service.getConnectionInfo();

    expect(result).toEqual(mockConnectionInfo);
    queryRawSpy.mockRestore();
  });

  it('should handle getConnectionInfo errors', async () => {
    const queryRawSpy = jest.spyOn(service, '$queryRaw').mockRejectedValue(new Error('Query failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(service.getConnectionInfo()).rejects.toThrow('Query failed');

    queryRawSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
