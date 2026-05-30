import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorNotificationService } from '../services/ui/error-notification.service';
import { catchError, tap, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorNotificationService);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        errorService.clearError();
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          errorService.showError(
            'Error de conexión: No se pudo establecer comunicación con el servidor. Verifica que el backend esté encendido.'
          );
        }
      }
      return throwError(() => error);
    })
  );
};
