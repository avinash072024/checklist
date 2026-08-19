import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SessionService } from '../session/session.service';
import { Constants } from '../../models/constants';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal('light');
  private platformId = inject(PLATFORM_ID);

  sessionService = inject(SessionService);

  constructor() {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (isBrowser) {
      this.theme.set(localStorage.getItem(Constants.THEME_KEY) || 'light');
    }

    // Automatically update DOM and localStorage when signals change
    effect(() => {
      if (isBrowser) {
        document.documentElement.setAttribute('data-bs-theme', this.theme());
        localStorage.setItem(Constants.THEME_KEY, this.theme());
      }
    });
  }

  toggleTheme(theme: string) {
    this.theme.set(theme);
    this.sessionService.setSession(Constants.THEME_KEY, this.theme());
    document.documentElement.setAttribute('data-bs-theme', this.theme());
  }
}
