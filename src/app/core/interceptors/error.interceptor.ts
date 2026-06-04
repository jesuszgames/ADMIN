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
        } else {
          let errMsg = 'Ha ocurrido un error en el servidor.';
          if (error.error && error.error.message) {
            try {
              const parsed = JSON.parse(error.error.message);
              if (typeof parsed === 'object' && parsed !== null) {
                errMsg = Object.values(parsed).join(', ');
              } else {
                errMsg = error.error.message;
              }
            } catch {
              errMsg = error.error.message;
            }
          } else if (error.message) {
            errMsg = error.message;
          }
          errorService.showError(errMsg);
        }
      }
      return throwError(() => error);
    })
  );
};
