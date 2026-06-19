import { Component, signal, inject } from '@angular/core';
import { Sidebar } from "./shared/components/sidebar/sidebar";
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { AuthService } from './core/services/api/auth.service';
import { ErrorNotificationService } from './core/services/ui/error-notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ADMIN');
  protected readonly authService = inject(AuthService);
  protected readonly errorService = inject(ErrorNotificationService);
  
  protected readonly isSidebarOpen = signal(false);

  toggleSidebar(state?: boolean): void {
    if (state !== undefined) {
      this.isSidebarOpen.set(state);
    } else {
      this.isSidebarOpen.update(isOpen => !isOpen);
    }
  }
}
