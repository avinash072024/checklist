import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserDropdownComponent } from "../user-dropdown/user-dropdown.component";

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

  navLinks: NavLinks[] = [
    { id: 1, label: 'Dashboard', path: '/dashboard' },
    { id: 1, label: 'Lists', path: '/lists' },
    { id: 1, label: 'Create List', path: '/create-list' }
  ]

  constructor(private router: Router) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // If window scrolls past 50px, add active visual effects
    this.isScrolled = window.scrollY > 50;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}