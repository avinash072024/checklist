import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ValidationsService } from '../../services/validations/validations.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  readonly validationService = inject(ValidationsService);

  // Stepper state: 1 = Enter Identifier, 2 = Enter OTP, 3 = Reset Password
  currentStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  isResendingOTP = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  // Saved identifier and masked user details for OTP screen
  savedIdentifier = signal<string>('');
  maskedDetails = signal<{ email: string | null; mobileNumber: string | null }>({
    email: null,
    mobileNumber: null
  });

  // Step 1 Form
  identifierForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required]]
  });

  // Step 2 Form
  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  // Step 3 Form
  resetPasswordForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  // Step 1: Submit Identifier to Send OTP
  onRequestOTP(): void {
    if (this.identifierForm.invalid) {
      this.identifierForm.markAllAsTouched();
      return;
    }

    const identifier = this.identifierForm.value.identifier.trim();
    this.isSubmitting.set(true);

    this.authService.forgotPassword({ identifier }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'OTP sent successfully');
          this.savedIdentifier.set(identifier);
          if (res.data) {
            this.maskedDetails.set(res.data);
          }
          this.currentStep.set(2);
        } else {
          this.toastr.error(res.message || 'Failed to send OTP');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastr.error(err.error?.message || 'Failed to request OTP. Please try again');
      }
    });
  }

  // Step 2: Verify OTP
  onVerifyOTP(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    const otp = this.otpForm.value.otp.trim();
    const identifier = this.savedIdentifier();
    this.isSubmitting.set(true);

    this.authService.verifyOTP({ identifier, otp }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'OTP verified successfully');
          this.currentStep.set(3);
        } else {
          this.toastr.error(res.message || 'Invalid OTP');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastr.error(err.error?.message || 'OTP verification failed');
      }
    });
  }

  // Resend OTP in Step 2
  onResendOTP(): void {
    const identifier = this.savedIdentifier();
    if (!identifier) return;

    this.isResendingOTP.set(true);

    this.authService.forgotPassword({ identifier }).subscribe({
      next: (res) => {
        this.isResendingOTP.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'A new OTP has been sent');
        } else {
          this.toastr.error(res.message || 'Failed to resend OTP');
        }
      },
      error: (err) => {
        this.isResendingOTP.set(false);
        this.toastr.error(err.error?.message || 'Failed to resend OTP');
      }
    });
  }

  // Step 3: Reset Password
  onResetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.resetPasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    const identifier = this.savedIdentifier();
    const otp = this.otpForm.value.otp.trim();

    this.isSubmitting.set(true);

    this.authService.resetPassword({ identifier, otp, newPassword }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'Password reset successfully');
          this.router.navigateByUrl('/login');
        } else {
          this.toastr.error(res.message || 'Failed to reset password');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastr.error(err.error?.message || 'Failed to reset password');
      }
    });
  }

  onOTPInput(event: any): void {
    event.target.value = this.validationService.onlyNumbers(event.target.value);
    this.otpForm.get('otp')?.setValue(event.target.value);
  }

  goBackToStep1(): void {
    this.currentStep.set(1);
    this.otpForm.reset();
  }
}
