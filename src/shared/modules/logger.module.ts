import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoModule } from 'nestjs-pino';
import { Env } from '@shared/utils/validate-env';

@Module({
  imports: [
    PinoModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => {
        const isProduction = config.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            quietReqLogger: true,
            quietResLogger: true,
            ...(isProduction
              ? {}
              : {
                  transport: {
                    target: 'pino-pretty',
                  },
                }),
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
