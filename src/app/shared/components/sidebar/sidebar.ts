import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html'
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  userRole = this.authService.getUserRole();

  logout(): void {
    this.authService.logout();
  }
}
