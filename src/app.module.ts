import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AdaptersModule } from './adapters/adapters.module';

@Module({
  imports: [
    // Configuration module with environment validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Core modules
    HealthModule,
    DatabaseModule,
    AdaptersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
