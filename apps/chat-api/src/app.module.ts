import { Module } from '@nestjs/common';
import { ErrorsModule } from './common/errors/errors.module.js';
import { LoggingModule } from './common/logging/logging.module.js';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [ConfigModule, LoggingModule, DatabaseModule, ErrorsModule],
})
export class AppModule {}
