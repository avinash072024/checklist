import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ListService } from '../../services/list/list.service';
import { SocketService } from '../../services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { User } from '../../models/user.model';
import { jwtDecode } from 'jwt-decode';
import { RouterLink } from "@angular/router";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  dashboard = signal({
    totalLists: 0,
    myLists: 0,
    otherLists: 0,
    privateList: 0
  });

  userDetails: any;

  listService = inject(ListService);
  socketService = inject(SocketService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  sessionService = inject(SessionService);

  private socketSub!: Subscription;

  ngOnInit(): void {
    this.getDashboardData();

    const token = this.sessionService.getCookie(Constants.token);
    if (token) {
      const decodedToken = jwtDecode<User>(token);
      this.userDetails = decodedToken;
    }

    // Subscribe to socket events for real-time dashboard stats update
    this.socketSub = this.socketService.onChecklistChange().subscribe(() => {
      this.getDashboardData(false);
    });
  }

  getDashboardData(showSpinner = true): void {
    if (showSpinner) {
      this.spinner.show();
    }
    this.listService.getDashboardStats().subscribe({
      next: (res: any) => {
        if (res?.success) {
          const { total, mine, others, privateCount } = res.data;
          this.dashboard.set({
            totalLists: total ?? 0,
            myLists: mine ?? 0,
            otherLists: others ?? 0,
            privateList: privateCount ?? 0
          });
        }
        if (showSpinner) this.spinner.hide();
      },
      error: (err) => {
        if (showSpinner) this.spinner.hide();
        this.toastr.error(err?.message || 'Something went wrong.');
      }
    });
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
  }
}