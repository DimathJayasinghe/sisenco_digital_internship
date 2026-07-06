import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { IApiErrorResponse } from '@sisenco/shared-types';

/**
 * Catches all exceptions and formats them into the standardized
 * error response format defined in ARCHITECTURE.md §4.
 *
 * Ensures no internal details (stack traces, DB errors, file paths)
 * leak to the client (SECURITY_GUIDELINES.md §6).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string[] = ['An unexpected error occurred'];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        error = exceptionResponse;
        message = [exceptionResponse];
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        error = (responseObj.error as string) || exception.name;

        if (Array.isArray(responseObj.message)) {
          message = responseObj.message as string[];
        } else if (typeof responseObj.message === 'string') {
          message = [responseObj.message];
        }
      }
    }

    const errorResponse: IApiErrorResponse = {
      statusCode,
      error,
      message,
    };

    response.status(statusCode).json(errorResponse);
  }
}
