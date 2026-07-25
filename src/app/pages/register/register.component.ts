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
  validationService = inject(ValidationsService)


  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }

  // onSubmit(): void {
  //   if (this.registerForm.valid) {
  //     this.isSubmitting.set(true);
  //     console.log('Form Submitted successfully:', this.registerForm.value);
  //   } else {
  //     // Mark all controls as touched to trigger validation visuals if user clicks submit early
  //     this.registerForm.markAllAsTouched();
  //   }
  // }

  onSubmit(): void {
    if (this.registerForm.valid) {
      debugger;
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
          debugger;
          if (res?.success && res?.token) {
            this.sessionService.setSession(Constants.token, res?.token)
            this.isSubmitting.set(false);
            this.registerForm.reset();
            this.toastr.success(res.message, 'Success');
            this.router.navigateByUrl('/dashboard');
          } else {
            this.toastr.error(res?.message || 'Failed to register', 'Registration failed:');
          }
        },
        error: (err) => {
          debugger;
          this.toastr.error(err.error?.message || 'Server error. Please try again', 'Registration failed:');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
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
    }

    event.target.value = value;
  }
}
