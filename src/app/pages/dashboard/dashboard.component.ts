import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, NgClass } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('staticBackdrop')
  modalElement!: ElementRef;
  modal!: bootstrap.Modal;

  listItems: any[] = [];
  deleteDetails: any;

  listService = inject(ListService);
  toastr = inject(ToastrService);
  sessionService = inject(SessionService);
  router = inject(Router);

  ngOnInit(): void {
    this.getLists();
  }

  getLists(): void {
    this.listService.getChecklists().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.listItems = res?.data || [];
          console.log('this.listItems', this.listItems);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err) => {
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
          this.toastr.success(res?.message);
          this.getLists();
          this.closeModal();
        } else {
          this.toastr.success(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.success(err);
      }
    })
  }

  ngAfterViewInit(): void {
    this.modal = new bootstrap.Modal(this.modalElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
  }

  openModal(data: any): void {
    debugger;
    this.deleteDetails = data;
    console.log('this.deleteDetails', this.deleteDetails);
    this.modal.show();
  }

  closeModal(): void {
    this.deleteDetails = null;
    this.modal.hide();
  }

  viewChecklist(checklistId: string): void {
    this.router.navigateByUrl(`/view-checklist/${checklistId}`);
  }

}
