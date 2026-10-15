import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { distinctUntilChanged, skip } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import * as AOS from 'aos';
import { NetworkService } from './services/network/network.service';
import { OfflinePageComponent } from './pages/offline-page/offline-page.component';
import { ToastrService } from 'ngx-toastr';

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
  // private destroyRef = inject(DestroyRef);
  // toastr = inject(ToastrService);

  ngOnInit(): void {
    this.networkService.onlineStatus$.subscribe(status => {
      this.isOnline = status;
    });

    // this.networkService.onlineStatus$
    //   .pipe(
    //     distinctUntilChanged(),
    //     skip(1),
    //     takeUntilDestroyed(this.destroyRef)
    //   )
    //   .subscribe(status => {
    //     if (status) {
    //       this.toastr.success('You are back online.');
    //     } else {
    //       this.toastr.warning('You are currently offline.');
    //     }
    //   });

    AOS.init({
      duration: 1000,
      mirror: true,
      easing: 'ease-in-out',
    });
  }
}
