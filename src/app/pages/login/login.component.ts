import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ValidationsService } from '../../services/validations/validations.service';
import { AuthService } from '../../services/auth/auth.service';
import { AuthResponse } from '../../models/auth.model';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  router = inject(Router);
  toastr = inject(ToastrService);

  isSubmitting = signal(false);
  showPassword = signal<boolean>(false);
  validationService = inject(ValidationsService);

  loginForm: FormGroup = this.fb.group({
    mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    let token = this.sessionService.getCookie(Constants.token);
    if (token) {
      this.router.navigateByUrl('/dashboard');
    }

  }

  togglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      let payload = {
        mobileNumber: Number(this.loginForm.value.mobileNumber),
        password: this.loginForm.value.password
      }
      this.isSubmitting.set(true);
      this.authService.signIn(payload).subscribe({
        next: (res: AuthResponse) => {
          if (res?.success && res?.token) {
            // this.sessionService.setSession(Constants.token, res?.token)
            this.sessionService.setCookie(Constants.token, res?.token);
            this.isSubmitting.set(false);
            this.loginForm.reset();
            this.toastr.success(res.message);
            this.router.navigateByUrl('/dashboard');
          } else {
            this.toastr.error(res?.message || 'Failed to login');
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Server error. Please try again');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onInputChange(event: any, field: string) {
    let value = event.target.value;

    switch (field) {
      case 'mobileNumber':
        value = this.validationService.onlyNumbers(value);
        break;
    }

    event.target.value = value;
  }
}
