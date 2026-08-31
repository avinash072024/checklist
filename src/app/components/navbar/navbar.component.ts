import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserDropdownComponent } from "../user-dropdown/user-dropdown.component";
import { Constants } from '../../models/constants';
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

interface NavLinks {
  id: number;
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, UserDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isScrolled = false;
  isLoggedIn = false; // Bind to Auth Service later
  appName: string = Constants.appName;

  sessionService = inject(SessionService);
  toastr = inject(ToastrService);

  navLinks: NavLinks[] = [
    { id: 1, label: 'Dashboard', path: '/dashboard' },
    { id: 2, label: 'Lists', path: '/lists' },
    { id: 3, label: 'Create List', path: '/create-list' }
  ]

  constructor(private router: Router) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // If window scrolls past 50px, add active visual effects
    this.isScrolled = window.scrollY > 50;
  }

  logout(): void {
    this.sessionService.logout();
    $('#LogoutStaticBackdrop').modal('hide');
    this.toastr.success('Logout successfully');
    this.router.navigateByUrl('/login');
  }
}