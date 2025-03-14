import {
  HttpStatus,
  RequestMethod,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { RedirectMiddleware } from '@/middlewares/redirect.middleware';
import { SetupScalar } from '@/configs/scalar.config';
import { AllConfigType } from '@/configs/config.type';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

export const bootstrap = async (app: NestExpressApplication) => {
  const logger = app.get(Logger);

  //   Middlewares
  const redirectMiddleware = new RedirectMiddleware();
  app.use(redirectMiddleware.use.bind(redirectMiddleware));

  // Interceptors
  // const responseInterceptor = new ResponseInterceptor(new Reflector());
  // app.useGlobalInterceptors(responseInterceptor);

  const configService = app.get(ConfigService<AllConfigType>);
  // const reflector = app.get(Reflector);
  // const isDevelopment =
  //   configService.getOrThrow('app.nodeEnv', { infer: true }) === 'development';
  const corsOrigin = configService.getOrThrow('app.corsOrigin', {
    infer: true,
  });

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });
  console.info('CORS Origin:', corsOrigin);

  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: [
        { method: RequestMethod.GET, path: '/' },
        { method: RequestMethod.GET, path: 'health' },
      ],
    },
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useLogger(logger);
  app.useGlobalFilters(new GlobalExceptionFilter(configService));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );
  SetupScalar(app);

  const port = configService.getOrThrow('app.port', { infer: true });

  await app.listen(port, () => {
    logger.log(`App listen at port ${port} 🚀`);
  });
};
