import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  setSession(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  getSession(key: string): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(key);
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  clearSession(): void {
    if (this.isBrowser) {
      localStorage.clear();
    }
  }
}
