import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { IApiResponse } from '@sisenco/shared-types';

/**
 * Intercepts all successful responses and wraps them in the
 * standardized IApiResponse format defined in ARCHITECTURE.md §4.
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message: 'Operation successful',
        data,
      })),
    );
  }
}
