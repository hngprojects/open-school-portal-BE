import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './winston.config';

/**
 * Logger Module
 *
 * This module provides Winston logger for the entire application.
 *
 * How it works:
 * 1. WinstonModule.forRoot() makes Winston available throughout the app
 * 2. Any service can inject LoggerService and use it
 * 3. NestJS will use this logger instead of its built-in logger
 *
 * Usage in services:
 * ```typescript
 * constructor(private readonly logger: LoggerService) {}
 *
 * this.logger.log('Something happened');
 * this.logger.error('Error occurred', error.stack);
 * ```
 */
@Module({
  imports: [
    // Register Winston as the global logger
    WinstonModule.forRoot(winstonConfig),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
