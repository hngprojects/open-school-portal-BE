import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class GlobalErrorInterceptor implements NestInterceptor {
  intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    return next.handle().pipe(catchError((err) => throwError(() => err)));
  }
}
