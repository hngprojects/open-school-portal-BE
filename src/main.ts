import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './middleware/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isDev = configService.get<boolean>('isDev');
  const allowedOrigins =
    configService.get<string>('CORS_ORIGINS')?.split(',') || [];

  app.enableCors({
    // In dev: allow all origins. In prod: use specific origins or allow all if none specified
    origin: isDev || allowedOrigins.length === 0 ? true : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const apiVersion = configService.get<string>('API_VERSION', 'v1');
  const globalPrefix = `${apiPrefix}/${apiVersion}`;

  app.setGlobalPrefix(globalPrefix, {
    exclude: ['docs'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Open School Portal API')
    .setDescription('API documentation for Open School Portal')
    .setVersion('1.0')
    .addTag('Waitlist')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Enter JWT token obtained from the login endpoint. Format: Bearer <token>',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Use Winston logger globally
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Inject your LoggingInterceptor
  const loggingInterceptor = app.get(LoggingInterceptor);
  app.useGlobalInterceptors(loggingInterceptor);

  const port = configService.get<string>('port');
  const env = configService.get<string>('env');
  const appName = configService.get<string>('app.name');

  if (isDev) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    app.use(require('morgan')('dev'));
  }

  // Get the Winston logger to use after startup
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  await app.listen(port);

  logger.log(
    `
      ------------
      Internal Application Started!
      Environment: ${env}
      API: http://localhost:${port}/
      API Docs: http://localhost:${port}/docs
      ------------
  `,
    ` ${appName} | ${env}`,
  );
}

bootstrap();
