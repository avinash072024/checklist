import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user.model';
import { Constants } from '../../models/constants';

@Component({
  selector: 'app-user-dropdown',
  imports: [RouterLink],
  templateUrl: './user-dropdown.component.html',
  styleUrl: './user-dropdown.component.scss'
})
export class UserDropdownComponent implements OnInit, OnDestroy {

  @Input() dynamicClass: string = '';
  sessionService = inject(SessionService);
  router = inject(Router);
  toastr = inject(ToastrService);
  userDetails: User | null = null;
  private subscription: Subscription | null = null;

  get displayName(): string {
    if (!this.userDetails) {
      return 'User';
    }
    const firstName = this.userDetails.firstName?.trim();
    const lastName = this.userDetails.lastName?.trim();
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }
    return this.userDetails.name || 'User';
  }

  ngOnInit(): void {
    this.subscription = this.sessionService.currentUser$.subscribe(user => {
      this.userDetails = user;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout(): void {
    this.sessionService.logout();
    this.toastr.success('Logout successfully');
    this.router.navigateByUrl('/login');
  }
}
