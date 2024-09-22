// NestJS Common Imports
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

// Loaders
import appConfig from './loaders/app.config';
import dbConfig from './loaders/database.config';

// Validation
import { validationSchema } from './schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      ignoreEnvFile: false,
      load: [appConfig, dbConfig],
      validationSchema,
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
})
export class CustomConfigModule {}
