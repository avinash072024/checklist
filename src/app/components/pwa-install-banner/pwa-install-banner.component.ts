import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { PwaService } from '../../services/pwa/pwa.service';

@Component({
  selector: 'app-pwa-install-banner',
  imports: [CommonModule],
  templateUrl: './pwa-install-banner.component.html',
  styleUrl: './pwa-install-banner.component.scss',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class PwaInstallBannerComponent implements OnInit {
  private pwaService = inject(PwaService);
  showBanner = false;

  ngOnInit() {
    this.pwaService.showInstallPrompt$.subscribe(show => {
      this.showBanner = show;
    });
  }

  install() {
    this.pwaService.installPwa();
  }

  dismiss() {
    this.pwaService.hidePrompt();
  }
}