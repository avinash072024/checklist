import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';

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
  userDetails: any;

  ngOnInit(): void {
    
  }

  logout(): void {
    this.sessionService.clearSession();
    this.toastr.success('Logout successfully', 'Success');
    this.router.navigateByUrl('/login');
  }
}
