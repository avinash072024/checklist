import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse, RegisterPayload, SignInPayload } from '../../models/auth.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  /**
   * Register a new user
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload);
  }

  /**
   * Sign in an existing user with mobile number and password
   */
  signIn(payload: SignInPayload): Observable<AuthResponse> {
    debugger;
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signin`, payload);
  }
}
