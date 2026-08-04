import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ListService } from '../../services/list/list.service';
import { SocketService } from '../../services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, NgClass } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';
import { Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { Subscription } from 'rxjs';
import { ListNotFoundCardComponent } from "../../components/list-not-found-card/list-not-found-card.component";
declare var $: any;

@Component({
  selector: 'app-lists',
  imports: [DatePipe, NgClass, RouterLink, BackButtonComponent, ListNotFoundCardComponent],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent implements OnInit, OnDestroy {

  listItems: any[] = [];
  deleteDetails: any;
  userDetails: any;

  listService = inject(ListService);
  socketService = inject(SocketService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  sessionService = inject(SessionService);
  router = inject(Router);

  private socketSub!: Subscription;
  listItemsCount!: number;

  ngOnInit(): void {
    const token = this.sessionService.getCookie(Constants.token);
    if (token) {
      this.userDetails = jwtDecode<User>(token);
    }
    this.getLists(true);

    // Listen for WebSocket real-time changes across all lists
    this.socketSub = this.socketService.onChecklistChange().subscribe(() => {
      this.getLists(false);
    });
  }

  getLists(showSpinner: boolean): void {
    if (showSpinner) {
      this.spinner.show();
    }

    this.listService.getChecklists().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.listItems = res?.data || [];
          this.listItemsCount = res?.count;
          if (showSpinner) this.spinner.hide();
        } else {
          if (showSpinner) this.spinner.hide();
          this.toastr.error(res?.message);
        }
      },
      error: (err) => {
        if (showSpinner) this.spinner.hide();
        // this.toastr.error(err?.message);
        this.toastr.error(err?.error?.message || 'Something went wrong.', err?.statusText);
      }
    });
  }

  getNameOfListCreated(data: any): string {
    return this.userDetails?.id == data?.id ? 'You' : data?.fullname;
  }

  deleteChecklist(): void {
    this.listService.deleteChecklist(this.deleteDetails?._id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeModal();
          this.toastr.success(res?.message);
          this.getLists(false);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Failed to delete checklist.');
      }
    });
  }

  downloadChecklistReport(checklistId: string): void {
    const checklist = this.listItems.find(item => item?._id === checklistId);
    const fileName = `checklist-${(checklist?.title || checklistId).replace(/[^a-z0-9_-]+/gi, '_').toLowerCase()}.pdf`;

    this.spinner.show();
    this.listService.downloadChecklistReport(checklistId).subscribe({
      next: (blob: Blob) => {
        this.spinner.hide();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to download checklist report.', err?.statusText || 'Error');
      }
    });
  }

  viewChecklist(checklistId: string): void {
    this.router.navigateByUrl(`/lists/view-checklist/${checklistId}`);
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
    this.socketSub?.unsubscribe();
  }
}