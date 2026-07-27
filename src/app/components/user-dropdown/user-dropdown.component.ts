import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user.model';
import { jwtDecode } from 'jwt-decode';
import { Constants } from '../../models/constants';

@Component({
  selector: 'app-user-dropdown',
  imports: [RouterLink],
  templateUrl: './user-dropdown.component.html',
  styleUrl: './user-dropdown.component.scss'
})
export class UserDropdownComponent implements OnInit {

  @Input() dynamicClass: string = '';
  sessionService = inject(SessionService);
  router = inject(Router);
  toastr = inject(ToastrService);
  userDetails: any = [];

  ngOnInit(): void {
    const token = this.sessionService.getCookie(Constants.token);

    if (token) {
      const decodedToken = jwtDecode<User>(token);
      this.userDetails = decodedToken;
    }
  }

  logout(): void {
    this.sessionService.deleteCookie(Constants.token);
    this.toastr.success('Logout successfully');
    this.router.navigateByUrl('/login');
  }
}
