import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ListService } from '../../services/list/list.service';
import { SocketService } from '../../services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Subscription } from 'rxjs';
import { ListNotFoundCardComponent } from "../../components/list-not-found-card/list-not-found-card.component";
import { ChecklistCardComponent } from "../../components/checklist-card/checklist-card.component";
import { CommonTopSectionComponent } from "../../components/common-top-section/common-top-section.component";
import { FormsModule } from '@angular/forms';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
declare var $: any;

@Component({
  selector: 'app-my-lists',
  imports: [ListNotFoundCardComponent, ChecklistCardComponent, CommonTopSectionComponent, FormsModule, SearchBoxComponent],
  templateUrl: './my-lists.component.html',
  styleUrl: './my-lists.component.scss'
})
export class MyListsComponent implements OnInit, OnDestroy {

  listItems: any[] = [];
  listItemsCount!: number;
  deleteDetails: any;
  userDetails: any;
  searchQuery: string = '';

  listService = inject(ListService);
  socketService = inject(SocketService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  sessionService = inject(SessionService);
  router = inject(Router);

  private socketSub!: Subscription;

  ngOnInit(): void {
    const token = this.sessionService.getCookie(Constants.token);
    if (token) {
      this.userDetails = jwtDecode<User>(token);
    }
    this.getLists(true);

    this.socketSub = this.socketService.onChecklistChange().subscribe(() => {
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

  onSearch(): void {
      if (!this.searchQuery.trim()) {
        this.getLists(true);
        return;
      }
      
      this.spinner.show();
      
      forkJoin({
        name: this.listService.searchChecklistsByName(this.searchQuery),
        // creator: this.listService.searchChecklistsByCreator(this.searchQuery)
      }).subscribe({
        next: (res: any) => {
          const nameRes = res.name;
          // const creatorRes = res.creator;
          
          let allItems: any[] = [];
          if (nameRes?.success && nameRes?.data) {
            allItems = [...allItems, ...nameRes.data];
          }
          // if (creatorRes?.success && creatorRes?.data) {
          //   allItems = [...allItems, ...creatorRes.data];
          // }
  
          const uniqueItemsMap = new Map();
          allItems.forEach(item => {
            uniqueItemsMap.set(item._id || item.id, item);
          });
          
          this.listItems = Array.from(uniqueItemsMap.values());
          this.listItemsCount = this.listItems.length;
  
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
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
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.error(err);
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