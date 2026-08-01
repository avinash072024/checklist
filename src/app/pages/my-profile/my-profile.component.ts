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
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  sessionService = inject(SessionService);
  authService = inject(AuthService);
  validationService = inject(ValidationsService);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);

  userDetails: User | null = null;
  editMode = signal(false);
  isSubmitting = signal(false);
  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

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
    this.profileForm.patchValue({
      name: this.userDetails.name,
      email: this.userDetails.email,
      mobileNumber: this.userDetails.mobileNumber?.toString() || ''
    });
  }

  avatarInitials(): string {
    if (!this.userDetails?.name) {
      return 'UD';
    }
    return this.userDetails.name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
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
      case 'name':
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
    debugger;
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const payload: UpdateProfilePayload = {
      name: this.profileForm.value.name,
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
