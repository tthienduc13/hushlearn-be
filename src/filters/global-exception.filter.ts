import { ErrorDetailDto } from '@/common/dtos/error-detail.dto';
import { ErrorDto } from '@/common/dtos/error.dto';
import { AllConfigType } from '@/configs/config.type';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validate.exception';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnprocessableEntityException,
  ValidationError,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STATUS_CODES } from 'http';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private debug: boolean = false;
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let error: ErrorDto;

    if (exception instanceof UnprocessableEntityException) {
      error = this.handleUnprocessableEntityException(exception);
    } else if (exception instanceof ValidationException) {
      error = this.handleValidationException(exception);
    } else if (exception instanceof HttpException) {
      error = this.handleHttpException(exception);
    } else {
      error = this.handleError(exception);
    }

    if (this.debug) {
      error.stack = exception.stack;
      error.trace = exception;

      this.logger.debug(error);
    }

    response.status(error.statusCode).json(error);
  }

  /**
   * Handles UnprocessableEntityException:
   * Check the request payload
   * Validate the input
   * @param exception UnprocessableEntityException
   * @returns ErrorDto
   */
  private handleUnprocessableEntityException(
    exception: UnprocessableEntityException,
  ): ErrorDto {
    const r = exception.getResponse() as { message: ValidationError[] };
    const statusCode = exception.getStatus();

    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Internal Server Error',
      message: 'Validation failed',
      details: this.extractValidationErrorDetails(r.message),
    };

    this.logger.debug(exception);

    return errorRes;
  }

  /**
   * Handles validation errors
   * @param exception ValidationException
   * @returns ErrorDto
   */
  private handleValidationException(exception: ValidationException): ErrorDto {
    const r = exception.getResponse() as {
      errorCode: ErrorCode;
      message: string;
    };
    const statusCode = exception.getStatus();

    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Internal Server Error',
      errorCode:
        Object.keys(ErrorCode)[Object.values(ErrorCode).indexOf(r.errorCode)],
      message: r?.message || 'An unexpected error occurred',
    };

    this.logger.debug(exception);

    return errorRes;
  }

  /**
   * Handles HttpException
   * @param exception HttpException
   * @returns ErrorDto
   */
  private handleHttpException(exception: HttpException): ErrorDto {
    const statusCode = exception.getStatus();
    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Internal Server Error',
      message: exception?.message || 'An unexpected error occurred',
    };

    this.logger.debug(exception);

    return errorRes;
  }

  /**
   * Handles QueryFailedError
   * @param error QueryFailedError
   * @returns ErrorDto
   */
  // private handleQueryFailedError(error: QueryFailedError): ErrorDto {
  //   const r = error as QueryFailedError & { constraint?: string };
  //   const { status, message } = r.constraint?.startsWith('UQ')
  //     ? {
  //         status: HttpStatus.CONFLICT,
  //         message: r.constraint
  //           ? this.i18n.t(
  //               (constraintErrors[r.constraint] ||
  //                 r.constraint) as keyof I18nTranslations,
  //             )
  //           : undefined,
  //       }
  //     : {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         message: this.i18n.t('common.error.internal_server_error'),
  //       };
  //   const errorRes = {
  //     timestamp: new Date().toISOString(),
  //     statusCode: status,
  //     error: STATUS_CODES[status],
  //     message,
  //   } as unknown as ErrorDto;

  //   this.logger.error(error);

  //   return errorRes;
  // }

  /**
   * Handles EntityNotFoundError when using findOrFail() or findOneOrFail() from TypeORM
   * @param error EntityNotFoundError
   * @returns ErrorDto
   */
  // private handleEntityNotFoundError(error: EntityNotFoundError): ErrorDto {
  //   const status = HttpStatus.NOT_FOUND;
  //   const errorRes = {
  //     timestamp: new Date().toISOString(),
  //     statusCode: status,
  //     error: STATUS_CODES[status],
  //     message: this.i18n.t('common.error.entity_not_found'),
  //   } as unknown as ErrorDto;

  //   this.logger.debug(error);

  //   return errorRes;
  // }

  /**
   * Handles generic errors
   * @param error Error
   * @returns ErrorDto
   */
  private handleError(error: Error): ErrorDto {
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorRes: ErrorDto = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Internal Server Error',
      message: error?.message || 'An unexpected error occurred',
    };

    this.logger.error(error);

    return errorRes;
  }

  /**
   * Extracts error details from ValidationError[]
   * @param errors ValidationError[]
   * @returns ErrorDetailDto[]
   */
  private extractValidationErrorDetails(
    errors: ValidationError[],
  ): ErrorDetailDto[] {
    const extractErrors = (
      error: ValidationError,
      parentProperty: string = '',
    ): ErrorDetailDto[] => {
      const propertyPath = parentProperty
        ? `${parentProperty}.${error.property}`
        : error.property;

      const currentErrors: ErrorDetailDto[] = Object.entries(
        error.constraints || {},
      ).map(([code, message]) => ({
        property: propertyPath,
        code,
        message,
      }));

      const childErrors: ErrorDetailDto[] =
        error.children?.flatMap((childError) =>
          extractErrors(childError, propertyPath),
        ) || [];

      return [...currentErrors, ...childErrors];
    };

    return errors.flatMap((error) => extractErrors(error));
  }
}
