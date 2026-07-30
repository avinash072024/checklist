import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ValidationsService } from '../../services/validations/validations.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  readonly validationService = inject(ValidationsService);

  // Active Tab: 'password' or 'otp'
  activeTab = signal<'password' | 'otp'>('password');
  isSubmitting = signal<boolean>(false);
  isSendingOTP = signal<boolean>(false);
  otpSent = signal<boolean>(false);

  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  // Form for Current Password Mode
  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  // Form for OTP Mode
  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.update(v => !v);
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  switchTab(tab: 'password' | 'otp'): void {
    this.activeTab.set(tab);
  }

  // Request OTP for authenticated user
  onSendOTP(): void {
    this.isSendingOTP.set(true);

    this.authService.sendChangePasswordOTP().subscribe({
      next: (res) => {
        this.isSendingOTP.set(false);
        if (res.success) {
          this.otpSent.set(true);
          this.toastr.success(res.message || 'OTP sent to your registered email & mobile');
        } else {
          this.toastr.error(res.message || 'Failed to send OTP');
        }
      },
      error: (err) => {
        this.isSendingOTP.set(false);
        this.toastr.error(err.error?.message || 'Failed to send OTP');
      }
    });
  }

  // Submit via Current Password
  onSubmitPasswordMode(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.toastr.error('New password and confirm password do not match');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'Password changed successfully');
          this.passwordForm.reset();
          this.router.navigateByUrl('/dashboard');
        } else {
          this.toastr.error(res.message || 'Failed to change password');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastr.error(err.error?.message || 'Failed to change password');
      }
    });
  }

  // Submit via OTP Mode
  onSubmitOTPMode(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    const { otp, newPassword, confirmPassword } = this.otpForm.value;

    if (newPassword !== confirmPassword) {
      this.toastr.error('New password and confirm password do not match');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.changePassword({ otp, newPassword }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.toastr.success(res.message || 'Password changed successfully');
          this.otpForm.reset();
          this.otpSent.set(false);
          this.router.navigateByUrl('/dashboard');
        } else {
          this.toastr.error(res.message || 'Failed to change password');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastr.error(err.error?.message || 'Failed to change password');
      }
    });
  }

  onOTPInput(event: any): void {
    const val = this.validationService.onlyNumbers(event.target.value);
    event.target.value = val;
    this.otpForm.get('otp')?.setValue(val);
  }
}
