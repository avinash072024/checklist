import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ListService } from '../../services/list/list.service';
import { SocketService } from '../../services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../services/session/session.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ListNotFoundCardComponent } from "../../components/list-not-found-card/list-not-found-card.component";
import { ChecklistCardComponent } from "../../components/checklist-card/checklist-card.component";
import { CommonTopSectionComponent } from "../../components/common-top-section/common-top-section.component";
import { FormsModule } from '@angular/forms';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
declare var $: any;

@Component({
  selector: 'app-lists',
  imports: [ListNotFoundCardComponent, ChecklistCardComponent, CommonTopSectionComponent, FormsModule, SearchBoxComponent],
  templateUrl: './lists.component.html',
})
export class ListsComponent implements OnInit, OnDestroy {

  listItems: any[] = [];
  deleteDetails: any;
  searchQuery: string = '';

  listService = inject(ListService);
  socketService = inject(SocketService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  sessionService = inject(SessionService);
  router = inject(Router);

  private socketSub!: Subscription;
  listItemsCount!: number;

  ngOnInit(): void {
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

  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.getLists(true);
    } else {
      this.spinner.show();
      this.listItems = this.listItems.filter(item => {
        const checklistName = item?.title?.toLowerCase() || '';
        const creatorName = item?.createdBy?.fullname?.toLowerCase() || '';

        return (
          checklistName.includes(query) ||
          creatorName.includes(query)
        );
      });
      this.spinner.hide();
    }

    this.listItemsCount = this.listItems.length;
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