import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any;
  private showInstallPromptSource = new BehaviorSubject<boolean>(false);

  public showInstallPrompt$ = this.showInstallPromptSource.asObservable();

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      // Notify components to show the install banner
      this.showInstallPromptSource.next(true);
    });
  }

  public async installPwa(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    // We've used the prompt, and can't use it again, discard it
    this.deferredPrompt = null;
    this.hidePrompt();

    return outcome === 'accepted';
  }

  public hidePrompt() {
    this.showInstallPromptSource.next(false);
  }
}
