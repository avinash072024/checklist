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
    const token = localStorage.getItem(Constants.token);

    if (token) {
      const decodedToken = jwtDecode<User>(token);
      this.userDetails = decodedToken;

      // console.log(decodedToken);
      // console.log(decodedToken.id);
      // console.log(decodedToken.name);
      // console.log(decodedToken.email);
    }
  }

  logout(): void {
    this.sessionService.clearSession();
    this.toastr.success('Logout successfully', 'Success');
    this.router.navigateByUrl('/login');
  }
}
