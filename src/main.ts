import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
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

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
