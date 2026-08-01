import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { SessionService } from '../../services/session/session.service';
import { AuthService } from '../../services/auth/auth.service';
import { ValidationsService } from '../../services/validations/validations.service';
import { Constants } from '../../models/constants';
import { User } from '../../models/user.model';
import { UpdateProfilePayload } from '../../models/auth.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dummy',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dummy.component.html',
  styleUrl: './dummy.component.scss'
})
export class DummyComponent implements OnInit {
  sessionService = inject(SessionService);
  authService = inject(AuthService);
  validationService = inject(ValidationsService);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);

  userDetails: User | null = null;
  editMode = signal(false);
  isSubmitting = signal(false);
  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  get firstName(): string {
    return this.splitName(this.userDetails?.name).firstName;
  }

  get lastName(): string {
    return this.splitName(this.userDetails?.name).lastName;
  }

  get displayName(): string {
    const value = [this.firstName, this.lastName].filter(Boolean).join(' ');
    return value || 'Valued User';
  }

  ngOnInit(): void {
    const token = this.sessionService.getCookie(Constants.token);
    if (token) {
      try {
        this.userDetails = jwtDecode<User>(token);
        this.patchForm();
      } catch (error) {
        console.error('Unable to decode user token', error);
      }
    }
  }

  patchForm(): void {
    if (!this.userDetails) {
      return;
    }
    const { firstName, lastName } = this.splitName(this.userDetails.name);
    this.profileForm.patchValue({
      firstName,
      lastName,
      email: this.userDetails.email,
      mobileNumber: this.userDetails.mobileNumber?.toString() || ''
    });
  }

  splitName(fullName = ''): { firstName: string; lastName: string } {
    const parts = fullName?.trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  }

  avatarInitials(): string {
    const { firstName, lastName } = this.splitName(this.userDetails?.name || '');
    if (!firstName && !lastName) {
      return 'UD';
    }
    return [firstName, lastName]
      .filter(Boolean)
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  formattedJoinDate(): string {
    if (!this.userDetails?.iat) {
      return 'Unknown';
    }
    const date = new Date(this.userDetails.iat * 1000);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  toggleEditMode(): void {
    this.editMode.update(value => !value);
    if (this.editMode()) {
      this.patchForm();
    }
  }

  onInputChange(event: any, field: string): void {
    let value = event.target.value;

    switch (field) {
      case 'firstName':
      case 'lastName':
        value = this.validationService.onlyCharacters(value);
        value = this.validationService.capitalizeFirstLetter(value);
        break;
      case 'mobileNumber':
        value = this.validationService.onlyNumbers(value);
        break;
    }

    event.target.value = value;
    this.profileForm.get(field)?.setValue(value, { emitEvent: false });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const fullName = [
      this.profileForm.value.firstName,
      this.profileForm.value.lastName
    ]
      .filter((part: string) => part && part.trim())
      .join(' ')
      .trim();

    const payload: UpdateProfilePayload = {
      name: fullName,
      email: this.profileForm.value.email,
      mobileNumber: Number(this.profileForm.value.mobileNumber)
    };

    this.isSubmitting.set(true);
    this.authService.updateProfile(payload).subscribe({
      next: res => {
        this.isSubmitting.set(false);
        if (res?.success) {
          if (res.token) {
            this.sessionService.setCookie(Constants.token, res.token);
            this.toastr.success('Profile updated successfully!', 'Success');
          }
          this.userDetails = {
            ...this.userDetails,
            ...payload
          } as User;
          this.editMode.set(false);
          this.patchForm();
        }
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.toastr.error(err?.message || 'Failed to update profile.', 'Error');
      }
    });
  }
}
