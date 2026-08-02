import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../services/session/session.service';
import { AuthService } from '../../services/auth/auth.service';
import { ValidationsService } from '../../services/validations/validations.service';
import { Constants } from '../../models/constants';
import { User } from '../../models/user.model';
import { ProfileResponse, UpdateProfilePayload } from '../../models/auth.model';
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

  get firstNameControl(): AbstractControl {
    return this.profileForm.get('firstName') as AbstractControl;
  }

  get lastNameControl(): AbstractControl {
    return this.profileForm.get('lastName') as AbstractControl;
  }

  get emailControl(): AbstractControl {
    return this.profileForm.get('email') as AbstractControl;
  }

  get mobileNumberControl(): AbstractControl {
    return this.profileForm.get('mobileNumber') as AbstractControl;
  }

  get firstName(): string {
    return this.userDetails?.firstName || this.splitName(this.userDetails?.name).firstName;
  }

  get lastName(): string {
    return this.userDetails?.lastName || this.splitName(this.userDetails?.name).lastName;
  }

  get displayName(): string {
    const value = [this.firstName, this.lastName].filter(Boolean).join(' ');
    return value || 'Valued User';
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res: ProfileResponse) => {
        if (res?.success && res?.data) {
          this.userDetails = res.data as User;
          this.sessionService.setCurrentUser(this.userDetails);
          this.patchForm();
        }
      },
      error: (err: any) => {
        console.error('Unable to load profile', err);
      }
    });
  }

  patchForm(): void {
    if (!this.userDetails) {
      return;
    }
    const firstName = this.userDetails.firstName || this.splitName(this.userDetails?.name).firstName;
    const lastName = this.userDetails.lastName || this.splitName(this.userDetails?.name).lastName;
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
    const firstName = this.userDetails?.firstName || this.splitName(this.userDetails?.name).firstName;
    const lastName = this.userDetails?.lastName || this.splitName(this.userDetails?.name).lastName;
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
    const createdAt = this.userDetails?.createdAt;
    const iat = this.userDetails?.iat;
    if (createdAt) {
      const date = new Date(createdAt);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    if (iat) {
      const date = new Date(iat * 1000);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return 'Unknown';
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

    const payload: UpdateProfilePayload = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      mobileNumber: Number(this.profileForm.value.mobileNumber)
    };

    this.isSubmitting.set(true);
    this.authService.updateProfile(payload).subscribe({
      next: res => {
        this.isSubmitting.set(false);
        if (res?.success && res?.data) {
          if (res.token) {
            this.sessionService.setCookie(Constants.token, res.token);
          }
          this.userDetails = {
            ...this.userDetails,
            ...res.data
          } as User;
          this.sessionService.setCurrentUser(this.userDetails);
          this.toastr.success('Profile updated successfully!');
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
