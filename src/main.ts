import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env, NodeEnv } from 'env.config';
import { HttpExceptionFilter } from 'src/common/filters/exception.filter';
import { ConsoleLogger, LogLevel, ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';

const LOG_LEVELS: Record<NodeEnv, LogLevel[]> = {
  production: ['log', 'warn', 'error'],
  development: ['log', 'warn', 'error', 'debug', 'verbose'],
  test: ['log', 'warn', 'error', 'debug', 'verbose', 'fatal'],
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      colors: env.LOGGER_COLORS,
      // json: env.LOGGER_JSON,
      logLevels: LOG_LEVELS[env.NODE_ENV],
    }),
    cors: true,
  });
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(morgan('dev'));

  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(env.PROJECT_TITLE)
      .setDescription(env.PROJECT_DESCRIPTION)
      .setVersion(env.PROJECT_VERSION)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(env.API_DOCS_PATH, app, document, {
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    });
  }
  await app.listen(env.PORT ?? 5000);
  console.info(`App running on http://localhost:${env.PORT ?? 5000}/`);
  console.info(
    `Docs available on http://localhost:${env.PORT ?? 5000}/${env.API_DOCS_PATH}`,
  );
}

bootstrap();
