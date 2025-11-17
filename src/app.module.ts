import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from './common/logger.module';
import { LoggingInterceptor } from './middleware/logging.interceptor';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { Session} from './modules/auth//entities/session.entity';
import { WaitlistModule } from './modules/waitlist/waitlist.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'school_portal_dev',
        password: 'yourpassword',
        database: process.env.NODE_ENV === 'test' ? 'school_portal_test' : 'school_portal_dev',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // dev/test only
        logging: true,
      }),
      // imports: [ConfigModule],
      // inject: [ConfigService],
      // useFactory: (config: ConfigService) => ({
      //   type: 'postgres',
      //   host: config.get<string>('DB_HOST'),
      //   port: config.get<number>('DB_PORT'),
      //   username: config.get<string>('DB_USER'),
      //   password: String(config.get<string>('DB_PASS') || 'postgres'),
      //   database: config.get<string>('DB_NAME'),
      //   autoLoadEntities: true,
      //   migrationsRun: false,
      //   synchronize: false,
      // }),
    }),
    WaitlistModule,
    UserModule,
    AuthModule,
    Session,
  ],
  controllers: [],
  providers: [LoggingInterceptor],
})
export class AppModule {}
