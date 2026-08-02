import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../models/constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private toastr = inject(ToastrService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.sessionService.logout();
          this.toastr.error('Session expired or invalid. Please log in again.', 'Authentication');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
