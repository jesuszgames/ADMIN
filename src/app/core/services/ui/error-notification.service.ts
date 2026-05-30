import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorNotificationService {
  readonly connectionError = signal<string | null>(null);

  showError(message: string): void {
    this.connectionError.set(message);
  }

  clearError(): void {
    this.connectionError.set(null);
  }
}
