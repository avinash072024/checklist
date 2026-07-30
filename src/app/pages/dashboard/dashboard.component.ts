import { Component, inject, OnInit, signal } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { User } from '../../models/user.model';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  dashboard = signal({
    totalLists: 0,
    myLists: 0,
    otherLists: 0
  });

  userDetails: any;

  listService = inject(ListService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  sessionService = inject(SessionService);

  private refreshSubscription!: Subscription;

  ngOnInit(): void {
    // this.getDashboardData(true);
    this.refreshSubscription = timer(0, 3000).subscribe(() => {
      this.getDashboardData(false);
    });

    const token = this.sessionService.getCookie(Constants.token);
    if (token) {
      const decodedToken = jwtDecode<User>(token);
      this.userDetails = decodedToken;
    }
  }

  getDashboardData(showSpinner: boolean): void {
    if (showSpinner) {
      this.spinner.show();
    }
    forkJoin({
      totalLists: this.listService.getChecklists(),
      myLists: this.listService.getChecklistsByMe(),
      otherLists: this.listService.getChecklistsByOther()
    }).subscribe({
      next: ({ totalLists, myLists, otherLists }) => {
        this.dashboard.set({
          totalLists: totalLists?.success ? (totalLists.count || 0) : 0,
          myLists: myLists?.success ? (myLists.count || 0) : 0,
          otherLists: otherLists?.success ? (otherLists.count || 0) : 0
        });

        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err?.message || 'Something went wrong.');
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }
}