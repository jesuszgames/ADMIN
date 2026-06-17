import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/api/auth.service';
import { ErrorNotificationService } from '../../../core/services/ui/error-notification.service';
import { ThemeService } from '../../../core/services/ui/theme.service';
import { CONNECTION_STATUS } from '../../../core/helpers/ui/constants';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  protected readonly errorService = inject(ErrorNotificationService);
  protected readonly themeService = inject(ThemeService);

  getUserName(): string {
    return this.authService.getUserName();
  }

  getInitials(): string {
    const name = this.getUserName() || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getUserRole(): string {
    return this.authService.getUserRole();
  }

  getConnectionClass(): string {
    return this.errorService.connectionError() ? CONNECTION_STATUS.OFFLINE : CONNECTION_STATUS.ONLINE;
  }

  getConnectionTooltip(): string {
    return this.errorService.connectionError() || 'Conectado al servidor';
  }
}


