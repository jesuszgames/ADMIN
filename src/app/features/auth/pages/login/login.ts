import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/api/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  username = '';
  password = '';
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage.set('Por favor, completa todos los campos.');
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.errorMessage.set(null);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Usuario o contraseña incorrectos.');
      }
    });
  }
}
