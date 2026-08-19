import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import * as AOS from 'aos';
import { NetworkService } from './services/network/network.service';
import { OfflinePageComponent } from './pages/offline-page/offline-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule, OfflinePageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'to-do-list';
  networkService = inject(NetworkService);
  isOnline: boolean = true;

  ngOnInit(): void {
    this.networkService.onlineStatus$.subscribe(status => {
      this.isOnline = status;
    });

    AOS.init({
      duration: 1000,
      // once: true,
      easing: 'ease'
    });
  }
}
