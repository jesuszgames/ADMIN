import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('GlobalErrorHandler: Se detectó un error no controlado:', error);
  }
}
