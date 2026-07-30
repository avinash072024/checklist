import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, NgClass } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';
import { Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
declare var $: any;

@Component({
  selector: 'app-my-lists',
  imports: [DatePipe, NgClass, RouterLink, BackButtonComponent],
  templateUrl: './my-lists.component.html',
  styleUrl: './my-lists.component.scss'
})
export class MyListsComponent implements OnInit, OnDestroy {

  listItems: any[] = [];
  deleteDetails: any;

  listService = inject(ListService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  sessionService = inject(SessionService);
  router = inject(Router);

  private refreshSubscription!: Subscription;

  ngOnInit(): void {
    this.getLists(true);
    this.refreshSubscription = timer(0, 3000).subscribe(() => {
      this.getLists(false);
    });
  }

  getLists(showSpinner: boolean): void {
    if (showSpinner) {
      this.spinner.show();
    }

    this.listService.getChecklistsByMe().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.listItems = res?.data || [];
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error(res?.message);
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err?.message);
      }
    })
  }

  getNameOfListCreated(data: any): string {
    const token = this.sessionService.getCookie(Constants.token);
    let userDetails: any;
    let userName: string;

    if (token) {
      const decodedToken = jwtDecode<User>(token);
      userDetails = decodedToken;
    }

    userName = userDetails?.id == data?.id ? 'You' : data?.fullname;
    return userName;
  }

  deleteChecklist(): void {
    this.listService.deleteChecklist(this.deleteDetails?._id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.getLists(false);
          this.closeModal();
          this.toastr.success(res?.message);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.error(err);
      }
    })
  }

  viewChecklist(checklistId: string): void {
    this.router.navigateByUrl(`/view-checklist/${checklistId}`);
  }

  openModal(data: any): void {
    if (data) {
      this.deleteDetails = data;
      $('#staticBackdrop').modal('show');
    }
  }

  closeModal(): void {
    this.deleteDetails = null;
    $('#staticBackdrop').modal('hide');
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }
}