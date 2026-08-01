import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ValidationsService } from '../../services/validations/validations.service';
import { AuthService } from '../../services/auth/auth.service';
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
import { AuthResponse } from '../../models/auth.model';
import { Constants } from '../../models/constants';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  router = inject(Router);
  toastr = inject(ToastrService);

  isSubmitting = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  validationService = inject(ValidationsService);
  
  // OTP Verification signals
  isOTPVerificationPending = signal<boolean>(false);
  isVerifyingOTP = signal<boolean>(false);
  isResendingOTP = signal<boolean>(false);
  userIdentifier = signal<string>(''); // Store email or mobile for OTP verification

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required]]
  });

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{4,6}$')]]
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      let payload = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        mobileNumber: Number(this.registerForm.value.mobileNumber),
        password: this.registerForm.value.password
      }
      this.isSubmitting.set(true);
      this.authService.register(payload).subscribe({
        next: (res: AuthResponse) => {
          if (res?.success) {
            // Account created but needs OTP verification
            this.isSubmitting.set(false);
            this.userIdentifier.set(this.registerForm.value.email);
            this.isOTPVerificationPending.set(true);
            this.toastr.success('Account created! Please verify your email with OTP.');
            this.otpForm.reset();
          } else {
            this.toastr.error(res?.message || 'Failed to register. Please try again');
            this.isSubmitting.set(false);
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Server error. Please try again');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  onVerifyOTP(): void {
    if (this.otpForm.valid) {
      this.isVerifyingOTP.set(true);
      const verifyPayload = {
        email: this.userIdentifier(),
        otp: this.otpForm.value.otp
      };

      this.authService.verifyRegistrationOTP(verifyPayload).subscribe({
        next: (res: AuthResponse) => {
          this.isVerifyingOTP.set(false);
          if (res?.success) {
            this.toastr.success(res.message || 'Email verified successfully!');
            this.isOTPVerificationPending.set(false);
            this.registerForm.reset();
            this.otpForm.reset();
            this.userIdentifier.set('');
            // Navigate to login or dashboard
            this.router.navigateByUrl('/login');
          } else {
            this.toastr.error(res?.message || 'Failed to verify OTP. Please try again');
          }
        },
        error: (err) => {
          this.isVerifyingOTP.set(false);
          this.toastr.error(err.error?.message || 'Server error. Please try again');
        }
      });
    } else {
      this.otpForm.markAllAsTouched();
    }
  }

  onResendOTP(): void {
    this.isResendingOTP.set(true);
    const resendPayload = {
      email: this.userIdentifier()
    };

    this.authService.resendRegistrationOTP(resendPayload).subscribe({
      next: (res: AuthResponse) => {
        this.isResendingOTP.set(false);
        this.toastr.success(res.message || 'OTP has been resent to your email');
        this.otpForm.patchValue({ otp: '' });
      },
      error: (err) => {
        this.isResendingOTP.set(false);
        this.toastr.error(err.error?.message || 'Failed to resend OTP. Please try again');
      }
    });
  }

  goBackToRegister(): void {
    this.isOTPVerificationPending.set(false);
    this.otpForm.reset();
    this.userIdentifier.set('');
  }

  onInputChange(event: any, field: string) {
    let value = event.target.value;

    switch (field) {
      case 'firstName':
        value = this.validationService.onlyCharacters(value);
        value = this.validationService.capitalizeFirstLetter(value);
        break;

      case 'lastName':
        value = this.validationService.onlyCharacters(value);
        value = this.validationService.capitalizeFirstLetter(value);
        break;

      case 'mobileNumber':
        value = this.validationService.onlyNumbers(value);
        break;

      case 'otp':
        value = this.validationService.onlyNumbers(value);
        break;
    }

    event.target.value = value;
  }
}
