import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

export async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*'),
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');

  const port = configService.get('PORT', 3000);

  await app.listen(port);

  logger.log(`🚀 Visiobook Core Database Service running on port ${port}`);
  logger.log(`📊 Health check available at: http://localhost:${port}/api/v1/health`);
  logger.log(`📖 API documentation: http://localhost:${port}/api/v1/docs`);
}

// Only run bootstrap if this file is executed directly (not during testing)
if (require.main === module) {
  bootstrap().catch(error => {
    const logger = new Logger('Bootstrap');
    logger.error('Failed to start application:', error);
    process.exit(1);
  });
}
