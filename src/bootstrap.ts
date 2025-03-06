import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { Env } from '@/shared/utils/validate-env';
import { RedirectMiddleware } from '@api/middlewares/redirect.middleware';
import { SetupScalar } from '@infra/configurations/scalar.config';

export const bootstrap = async (app: NestExpressApplication) => {
  const logger = app.get(Logger);
  const configService = app.get(ConfigService<Env>);

  //   Middlewares
  const redirectMiddleware = new RedirectMiddleware();
  app.use(redirectMiddleware.use.bind(redirectMiddleware));

  // Interceptors
  // const responseInterceptor = new ResponseInterceptor(new Reflector());
  // app.useGlobalInterceptors(responseInterceptor);

  app.setGlobalPrefix('/api/v1');

  app.enableCors({
    credentials: true,
    origin: '*',
    // configService.get('ALLOW_CORS_URL'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    // exposedHeaders: [Headers.HeaderPagination as string],
  });

  app.useLogger(logger);
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

  SetupScalar(app);

  const port = configService.get('PORT') || 8080;

  await app.listen(port, () => {
    logger.log(`App listen at port ${port} 🚀`);
  });
};
