import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ApiResponse } from '@sisenco/shared-types';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wraps every successful handler result in the standard success envelope
 * `{ statusCode, message, data }` defined in ARCHITECTURE.md §4. Handlers return
 * their raw payload; this interceptor shapes the response.
 */
@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse<Response>().statusCode;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message: 'OK',
        data,
      })),
    );
  }
}
