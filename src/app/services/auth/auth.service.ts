import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ProfileResponse,
  RegisterPayload,
  ResetPasswordPayload,
  SignInPayload,
  UpdateProfilePayload,
  VerifyOTPPayload,
  VerifyRegistrationOTPPayload,
  ResendRegistrationOTPPayload
} from '../../models/auth.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Constants } from '../../models/constants';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);

  // private getAuthHeaders() {
  //   return {
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${this.sessionService.getCookie(Constants.token) || ''}`
  //     })
  //   };
  // }

  /**
   * Register a new user
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload);
  }

  /**
   * Verify registration OTP
   */
  verifyRegistrationOTP(payload: VerifyRegistrationOTPPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/verify-registration-otp`, payload);
  }

  /**
   * Resend registration OTP
   */
  resendRegistrationOTP(payload: ResendRegistrationOTPPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/resend-registration-otp`, payload);
  }

  /**
   * Sign in an existing user with mobile number and password
   */
  signIn(payload: SignInPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signin`, payload);
  }

  /**
   * Request OTP for Forgot Password
   */
  forgotPassword(payload: ForgotPasswordPayload): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${environment.apiUrl}/auth/forgot-password`, payload);
  }

  /**
   * Verify OTP for Forgot Password
   */
  verifyOTP(payload: VerifyOTPPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/verify-otp`, payload);
  }

  /**
   * Reset password using OTP
   */
  resetPassword(payload: ResetPasswordPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/reset-password`, payload);
  }

  /**
   * Authenticated: Send OTP for Change Password
   */
  sendChangePasswordOTP(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/send-change-password-otp`,
      {},
      this.sessionService.getAuthHeaders()
    );
  }

  /**
   * Authenticated: Change Password using Current Password and/or OTP
   */
  changePassword(payload: ChangePasswordPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/change-password`,
      payload,
      this.sessionService.getAuthHeaders()
    );
  }

  /**
   * Get authenticated user's profile
   */
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${environment.apiUrl}/auth/profile`,
      this.sessionService.getAuthHeaders()
    );
  }

  /**
   * Update authenticated user profile details
   */
  updateProfile(payload: UpdateProfilePayload): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(
      `${environment.apiUrl}/auth/profile`,
      payload,
      this.sessionService.getAuthHeaders()
    );
  }
}
