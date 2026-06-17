import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.getInitialTheme());

  readonly currentTheme = this.themeSignal.asReadonly();

  constructor() {
    // Sync theme to document element
    effect(() => {
      const theme = this.themeSignal();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }

  toggleTheme(): void {
    this.themeSignal.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  private getInitialTheme(): Theme {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Default to dark mode since it's the premium default design
    return 'dark';
  }
}
