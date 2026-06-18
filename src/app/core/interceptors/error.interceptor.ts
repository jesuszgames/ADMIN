import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorNotificationService } from '../services/ui/error-notification.service';
import { catchError, tap, throwError } from 'rxjs';

const ERROR_TRANSLATIONS: { [key: string]: string } = {
  'The sum of beneficiary and winner percentages must be exactly 100%':
    'La suma de los porcentajes del beneficiario y del ganador debe ser exactamente el 100%',
  'The startDate must be before the endDate':
    'La fecha de inicio debe ser anterior a la fecha de finalización',
  'The maximum potential revenue (tickets * price) cannot be less than the goal':
    'Los ingresos máximos potenciales (boletos × precio) no pueden ser menores que la meta establecida',
  'Ticket is not sold or assigned': 'El boleto no está vendido ni asignado',
  'Incorrect username or password': 'Usuario o contraseña incorrectos',
  'Cannot execute draw. Raffle is not active':
    'No se puede ejecutar el sorteo. La rifa no está activa',
  'Cannot change ticket price for a raffle with sold tickets':
    'No se puede cambiar el precio del boleto para una rifa con boletos vendidos',
  'Cannot change total tickets for a raffle with sold tickets':
    'No se puede cambiar el total de boletos para una rifa con boletos vendidos',
  'Cannot delete foundation because it has active raffles associated':
    'No se puede eliminar la fundación porque tiene rifas activas asociadas',
  'Cannot delete category because it has active raffles associated':
    'No se puede eliminar la categoría porque tiene rifas activas asociadas',
  'Cannot unlink tickets from a finished or deleted raffle':
    'No se pueden desvincular boletos de una rifa finalizada o eliminada',
  'Username is already registered': 'El nombre de usuario ya está registrado',
  'Your account has been deactivated or deleted': 'Tu cuenta ha sido desactivada o eliminada',
  'User already exists': 'El usuario ya existe',
  'Resource not found': 'El recurso solicitado no fue encontrado',
  'Logged out successfully': 'Sesión cerrada correctamente',
  'jwt expired': 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión',
  'Invalid token': 'Sesión inválida o expirada',
  'Cannot delete a raffle with sold tickets': 'No se puede eliminar una rifa que ya tiene boletos vendidos',
  'Cannot select an inactive category': 'No se puede seleccionar una categoría inactiva',
  'Cannot select an inactive foundation': 'No se puede seleccionar una fundación inactiva',
  'Cannot select a deleted category': 'No se puede seleccionar una categoría eliminada',
  'Cannot select a deleted foundation': 'No se puede seleccionar una fundación eliminada',
};

function translateError(msg: string): string {
  if (!msg) return msg;
  const trimmed = msg.trim();

  if (ERROR_TRANSLATIONS[trimmed]) {
    return ERROR_TRANSLATIONS[trimmed];
  }

  const lowerMsg = trimmed.toLowerCase();
  if (
    lowerMsg.startsWith('cannot get /') ||
    lowerMsg.startsWith('cannot post /') ||
    lowerMsg.startsWith('cannot put /') ||
    lowerMsg.startsWith('cannot delete /') ||
    lowerMsg.includes('http failure response') ||
    lowerMsg.includes('internal server error') ||
    lowerMsg.includes('500')
  ) {
    return 'Ha ocurrido un error inesperado en el servidor. Por favor, inténtalo de nuevo más tarde.';
  }

  // Hide token or unauthorized technical errors
  if (lowerMsg.includes('token missing') || lowerMsg.includes('unauthorized')) {
    return 'Acceso no autorizado o sesión expirada. Por favor, vuelve a iniciar sesión.';
  }

  // Common phrase translations for Joi validator
  let translated = msg;
  translated = translated.replace(/must be a string/gi, 'debe ser un texto válido');
  translated = translated.replace(/must not be empty/gi, 'no puede estar vacío');
  translated = translated.replace(
    /must be at least (\d+) characters long/gi,
    'debe tener al menos $1 caracteres',
  );
  translated = translated.replace(
    /must not be longer than (\d+) characters/gi,
    'no puede tener más de $1 caracteres',
  );
  translated = translated.replace(
    /must be a valid email/gi,
    'debe ser un correo electrónico válido',
  );
  translated = translated.replace(/must be a number/gi, 'debe ser un número');
  translated = translated.replace(
    /must be greater than or equal to (\d+)/gi,
    'debe ser mayor o igual a $1',
  );
  translated = translated.replace(
    /must be less than or equal to (\d+)/gi,
    'debe ser menor o igual a $1',
  );
  translated = translated.replace(/is required/gi, 'es requerido');
  translated = translated.replace(/Unexpected field/gi, 'Campo inesperado');

  // Field name translation helpers
  translated = translated.replace(/\bname\b/gi, 'El nombre');
  translated = translated.replace(/\bdescription\b/gi, 'La descripción');
  translated = translated.replace(/\bicon\b/gi, 'El icono');
  translated = translated.replace(/\bemail\b/gi, 'El correo electrónico');
  translated = translated.replace(/\bpassword\b/gi, 'La contraseña');
  translated = translated.replace(/\busername\b/gi, 'El nombre de usuario');

  return translated;
}

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
            'Error de conexión: No se pudo establecer comunicación con el servidor. Verifica que el backend esté encendido.',
          );
        } else {
          let errMsg = 'Ha ocurrido un error en el servidor.';
          if (error.error && error.error.message) {
            const rawMsg = error.error.message;
            if (typeof rawMsg === 'object' && rawMsg !== null) {
              errMsg = Object.values(rawMsg)
                .map((m) => translateError(String(m)))
                .join(', ');
            } else if (typeof rawMsg === 'string') {
              try {
                const parsed = JSON.parse(rawMsg);
                if (typeof parsed === 'object' && parsed !== null) {
                  errMsg = Object.values(parsed)
                    .map((m) => translateError(String(m)))
                    .join(', ');
                } else {
                  errMsg = translateError(parsed);
                }
              } catch {
                errMsg = translateError(rawMsg);
              }
            } else {
              errMsg = translateError(String(rawMsg));
            }
          } else if (error.message) {
            errMsg = translateError(error.message);
          }
          errorService.showError(errMsg);
        }
      }
      return throwError(() => error);
    }),
  );
};
