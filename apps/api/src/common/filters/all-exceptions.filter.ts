import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiError } from '@sisenco/shared-types';
import { Request, Response } from 'express';

/**
 * Catches every exception and formats it into the standard error envelope
 * (ARCHITECTURE.md §4), so internal details (stack traces, DB errors) never leak.
 * Unknown/unhandled errors become a generic 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const { error, message } = this.resolveBody(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url}`, exception as Error);
    }

    const body: ApiError = { statusCode: status, error, message };
    response.status(status).json(body);
  }

  private resolveBody(exception: unknown): { error: string; message: string | string[] } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return { error: exception.name, message: res };
      }
      const obj = res as { error?: string; message?: string | string[] };
      return {
        error: obj.error ?? exception.name,
        message: obj.message ?? exception.message,
      };
    }

    return { error: 'Internal Server Error', message: 'An unexpected error occurred' };
  }
}
