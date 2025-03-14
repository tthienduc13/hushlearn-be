/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { type AllConfigType } from '@/configs/config.type';
import { loggingRedactPaths, LogService } from '@/constants/app.constant';
import { ConfigService } from '@nestjs/config';
import { type IncomingMessage, type ServerResponse } from 'http';
import { Params } from 'nestjs-pino';
import { GenReqId, Options, type ReqId } from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

const PinoLevelToGoogleLoggingSeverityLookup = Object.freeze({
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
});

const genReqId: GenReqId = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
) => {
  const id: ReqId = req.headers['x-request-id']?.toString() || uuidv4();
  res.setHeader('X-Request-Id', id);
  return id;
};

const customSuccessMessage = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  responseTime: number,
) =>
  `[${req.id || '*'}] "${req.method} ${req.url}" ${res.statusCode} - "${req.headers?.host || '-'}" "${req.headers?.['user-agent'] || '-'}" - ${responseTime} ms`;

const customReceivedMessage = (req: IncomingMessage) =>
  `[${req.id || '*'}] "${req.method} ${req.url}"`;

const customErrorMessage = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  err: Error,
) =>
  `[${req.id || '*'}] "${req.method} ${req.url}" ${res.statusCode} - "${req.headers?.host || '-'}" "${req.headers?.['user-agent'] || '-'}" - message: ${err.message}`;

function logServiceConfig(logService: LogService): Options {
  switch (logService) {
    case LogService.GOOGLE_LOGGING:
      return googleLoggingConfig();
    case LogService.AWS_CLOUDWATCH:
      return cloudwatchLoggingConfig();
    case LogService.CONSOLE:
    default:
      return consoleLoggingConfig();
  }
}

function cloudwatchLoggingConfig(): Options {
  // Placeholder for AWS CloudWatch configuration
  return {
    messageKey: 'message',
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
  };
}

function googleLoggingConfig(): Options {
  return {
    messageKey: 'message',
    formatters: {
      level(label, number) {
        return {
          severity:
            PinoLevelToGoogleLoggingSeverityLookup[label] ||
            PinoLevelToGoogleLoggingSeverityLookup['info'],
          level: number,
        };
      },
    },
  };
}

function consoleLoggingConfig(): Options {
  return {
    messageKey: 'msg',
    transport: {
      target: 'pino-pretty',
      options: {
        singleLine: true,
        ignore:
          'req.id,req.method,req.url,req.headers,req.remoteAddress,req.remotePort,res.headers',
      },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
async function loggerFactory(
  configService: ConfigService<AllConfigType>,
): Promise<Params> {
  const logLevel = configService.get('app.logLevel', { infer: true });
  const logService = configService.get('app.logService', { infer: true });
  const isDebug = configService.get('app.debug', { infer: true });

  const pinoHttpOptions: Options = {
    level: logLevel,
    genReqId: isDebug ? genReqId : undefined,
    serializers: isDebug
      ? {
          req: (req) => {
            req.body = req.raw.body;
            return req;
          },
        }
      : undefined,
    customSuccessMessage,
    customReceivedMessage,
    customErrorMessage,
    redact: {
      paths: loggingRedactPaths,
      censor: '**GDPR COMPLIANT**',
    },
    ...logServiceConfig(logService as LogService),
  };

  return {
    pinoHttp: pinoHttpOptions,
  };
}

export default loggerFactory;
