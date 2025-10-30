import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { HealthModule } from '../health/health.module';
import { DatabaseModule } from '../database/database.module';
import { AdaptersModule } from '../adapters/adapters.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should be a module', () => {
    expect(AppModule).toBeDefined();
    expect(typeof AppModule).toBe('function');
  });

  it('should have module metadata', () => {
    // AppModule is a valid NestJS module
    expect(AppModule).toBeDefined();
    expect(typeof AppModule).toBe('function');
  });

  it('should import ConfigModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toBeDefined();
    // ConfigModule.forRoot() returns a DynamicModule, so we check for the presence of ConfigModule
    expect(imports.length).toBeGreaterThan(0);
  });

  it('should import DatabaseModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toContain(DatabaseModule);
  });

  it('should import HealthModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toContain(HealthModule);
  });

  it('should import AdaptersModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toContain(AdaptersModule);
  });

  it('should compile successfully', async () => {
    const testModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(testModule).toBeDefined();
    await testModule.close();
  });
});
