import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/api/auth.service';
import { ErrorNotificationService } from '../../../core/services/ui/error-notification.service';
import { CONNECTION_STATUS } from '../../../core/helpers/ui/constants';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  protected readonly errorService = inject(ErrorNotificationService);

  getUserName(): string {
    return this.authService.getUserName();
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


