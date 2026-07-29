import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, NgClass } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';
import { Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
  selector: 'app-lists',
  imports: [DatePipe, NgClass, RouterLink],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent implements OnInit {

  listItems: any[] = [];
  deleteDetails: any;

  listService = inject(ListService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  sessionService = inject(SessionService);
  router = inject(Router);

  ngOnInit(): void {
    this.getLists(true);
  }

  getLists(showSpinner: boolean): void {
    if (showSpinner) {
      this.spinner.show();
    }

    this.listService.getChecklists().subscribe({
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
}