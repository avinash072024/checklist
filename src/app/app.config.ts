import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top' // Force scroll to top on every navigation
      })
    ),
    provideHttpClient(),
    provideAnimations(),
    provideToastr({
      timeOut: 5000,
      extendedTimeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      countDuplicates: true,
      resetTimeoutOnDuplicate: true,
      progressBar: true,
      newestOnTop: true,
      enableHtml: false,
      tapToDismiss: false,
      easeTime: 500,
    })
  ]
};
