import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline-page',
  imports: [CommonModule],
  templateUrl: './offline-page.component.html',
  styleUrl: './offline-page.component.scss'
})
export class OfflinePageComponent implements OnInit, OnDestroy {
  isOnline = signal<boolean>(navigator.onLine);
  isChecking = signal<boolean>(false);
  countdown = signal<number>(20);

  private timerInterval: any;

  ngOnInit() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
    this.startCountdown();
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
    this.clearCountdown();
  }

  private updateOnlineStatus = () => {
    const online = navigator.onLine;
    this.isOnline.set(online);
    if (online) {
      this.clearCountdown();
    }
  };

  startCountdown() {
    this.clearCountdown();
    this.countdown.set(20);
    this.timerInterval = setInterval(() => {
      this.countdown.update(val => {
        if (val <= 1) {
          this.retryConnection();
          return 20;
        }
        return val - 1;
      });
    }, 1000);
  }

  clearCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  retryConnection() {
    this.isChecking.set(true);
    this.clearCountdown();

    setTimeout(() => {
      const online = navigator.onLine;
      this.isOnline.set(online);
      this.isChecking.set(false);
      if (!online) {
        this.startCountdown();
      }
    }, 1200);
  }
}