import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ValidationsService } from '../../services/validations/validations.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  fb = inject(FormBuilder);

  isSubmitting = signal(false);
  showPassword = signal<boolean>(false);
  validationService = inject(ValidationsService);

  loginForm: FormGroup = this.fb.group({
    mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      console.log('Form Submitted successfully:', this.loginForm.value);
    } else {
      // Mark all controls as touched to trigger validation visuals if user clicks submit early
      this.loginForm.markAllAsTouched();
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
