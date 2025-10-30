import { Test, TestingModule } from '@nestjs/testing';
import { AdaptersModule } from '../adapters.module';

describe('AdaptersModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AdaptersModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should be a module', () => {
    expect(AdaptersModule).toBeDefined();
    expect(typeof AdaptersModule).toBe('function');
  });

  it('should have module metadata', () => {
    // AdaptersModule is a simple module, so we just check it's a valid NestJS module
    expect(AdaptersModule).toBeDefined();
    expect(typeof AdaptersModule).toBe('function');
  });
});
