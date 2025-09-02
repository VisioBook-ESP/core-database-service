import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '../health.module';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';
import { DatabaseModule } from '../../database/database.module';

describe('HealthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        DatabaseModule,
        HealthModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide HealthController', () => {
    const healthController = module.get<HealthController>(HealthController);
    expect(healthController).toBeDefined();
    expect(healthController).toBeInstanceOf(HealthController);
  });

  it('should provide HealthService', () => {
    const healthService = module.get<HealthService>(HealthService);
    expect(healthService).toBeDefined();
    expect(healthService).toBeInstanceOf(HealthService);
  });

  it('should have HealthController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', HealthModule);
    expect(controllers).toContain(HealthController);
  });

  it('should have HealthService in providers', () => {
    const providers = Reflect.getMetadata('providers', HealthModule);
    expect(providers).toContain(HealthService);
  });
});
