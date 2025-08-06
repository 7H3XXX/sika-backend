import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { env } from 'env.config';
import { Response, Request } from 'express';
import { AppContracts } from 'src/app.contracts';
import { EventsAppInternalErrorDto } from 'src/events/dto/app-events.dto';
import { ApiErrorCodes } from 'types/error.codes';

type ExceptionResponse =
  | string
  | { message: string | string[]; errorCode: string };

const genericHttpExceptionErrorCodes: Record<string, string> = {
  '400': ApiErrorCodes.BAD_REQUEST,
  '429': ApiErrorCodes.TOO_MANY_REQUESTS,
  '500': ApiErrorCodes.INTERNAL_SERVER_ERROR,
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message: string | Record<string, string> = 'Something went wrong!';
    let errorCode: string = ApiErrorCodes.UNKNOWN_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ExceptionResponse;
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        Object.hasOwn(exceptionResponse, 'message')
      ) {
        const excMessage = exceptionResponse.message;
        if (Array.isArray(excMessage)) {
          message = excMessage.join(', ');
        } else {
          message = excMessage;
        }
        if (exceptionResponse?.errorCode) {
          errorCode = exceptionResponse?.errorCode;
        }
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ApiErrorCodes.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      this.logger.error(exception);
    }
    // notify dev team if HttpException Status is HttpStatus.INTERNAL_SERVER_ERROR
    if (status === 500) {
      const requestUrl =
        request.protocol + '://' + request.get('host') + request.originalUrl;
      if (!requestUrl.includes('localhost')) {
        this.eventEmitter.emit(
          AppContracts.events.app.internalError,
          new EventsAppInternalErrorDto({
            appName: env.PROJECT_TITLE,
            appStaging: env.NODE_ENV,
            errorMessage: message,
            method: request.method,
            requestUrl,
            payloadData: JSON.stringify(request.body),
            errorStack: exception.stack,
          }),
        );
      }
    } else if (
      genericHttpExceptionErrorCodes[String(status)] &&
      errorCode === ApiErrorCodes.UNKNOWN_ERROR
    ) {
      errorCode = genericHttpExceptionErrorCodes[String(status)];
    }
    response.status(status).json({
      errorCode,
      status: false,
      message,
      data: null,
    });
  }
}
