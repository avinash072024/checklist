import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserDropdownComponent } from "../user-dropdown/user-dropdown.component";

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, UserDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isScrolled = false;
  isLoggedIn = false; // Bind to Auth Service later

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