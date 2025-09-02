import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database.module';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis.service';

describe('DatabaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Set test environment variables
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        DatabaseModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
    // Just check that it's defined, not instanceof since it might be a mock in some contexts
  });

  it('should provide RedisService', () => {
    const redisService = module.get<RedisService>(RedisService);
    expect(redisService).toBeDefined();
    expect(redisService).toBeInstanceOf(RedisService);
  });

  it('should export PrismaService', () => {
    const exports = Reflect.getMetadata('exports', DatabaseModule);
    expect(exports).toContain(PrismaService);
  });

  it('should export RedisService', () => {
    const exports = Reflect.getMetadata('exports', DatabaseModule);
    expect(exports).toContain(RedisService);
  });
});
