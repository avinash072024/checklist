import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ListService } from '../../services/list/list.service';
import { SocketService } from '../../services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../services/session/session.service';
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
  selector: 'app-private-lists',
  imports: [ListNotFoundCardComponent, ChecklistCardComponent, CommonTopSectionComponent, FormsModule, SearchBoxComponent],
  templateUrl: './private-lists.component.html',
})
export class PrivateListsComponent implements OnInit, OnDestroy {

  listItems: any[] = [];
  listItemsCount!: number;
  deleteDetails: any;
  shareDetails: any;
  users: any[] = [];
  selectedUserIds: string[] = [];
  isLoadingUsers = false;
  shareUsersError: string | null = null;
  isSavingShare = false;
  currentUserId: string | null = null;
  searchQuery: string = '';

  listService = inject(ListService);
  socketService = inject(SocketService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);
  sessionService = inject(SessionService);
  router = inject(Router);

  private socketSub!: Subscription;

  ngOnInit(): void {
    this.sessionService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || user?.userId || null;
    }).unsubscribe();

    this.getLists(true);

    this.socketSub = this.socketService.onChecklistChange().subscribe(() => {
      this.getLists(false);
    });
  }

  getLists(showSpinner: boolean): void {
    if (showSpinner) {
      this.spinner.show();
    }

    forkJoin({
      ownedLists: this.listService.getPrivateChecklists(),
      sharedLists: this.listService.getSharedChecklists()
    }).subscribe({
      next: ({ ownedLists, sharedLists }: any) => {
        if (!ownedLists?.success || !sharedLists?.success) {
          if (showSpinner) this.spinner.hide();
          this.toastr.error(
            ownedLists?.message || sharedLists?.message || 'Unable to load private checklists.'
          );
          return;
        }

        const ownedItems = (Array.isArray(ownedLists.data) ? ownedLists.data : [])
          .map((item: any) => ({ ...item, isOwnedByCurrentUser: true }));
        const ownedIds = new Set(ownedItems.map((item: any) => item?._id));
        const sharedItems = (Array.isArray(sharedLists.data) ? sharedLists.data : [])
          .filter((item: any) => !ownedIds.has(item?._id))
          .map((item: any) => ({ ...item, isOwnedByCurrentUser: false }));

        this.listItems = [...ownedItems, ...sharedItems].sort((a, b) =>
          new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
        );
        this.listItemsCount = this.listItems.length;
        if (showSpinner) this.spinner.hide();
      },
      error: (err) => {
        if (showSpinner) this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Unable to load private checklists.', err?.statusText);
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
        return (checklistName.includes(query));
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

  openShareModal(item: any): void {
    this.shareDetails = item;
    this.selectedUserIds = (Array.isArray(item?.sharedWith) ? item.sharedWith : [])
      .map((user: any) => this.getUserId(user))
      .filter((userId: string | null): userId is string => !!userId);
    this.users = [];
    this.isLoadingUsers = true;
    this.shareUsersError = null;
    $('#shareChecklistModal').modal('show');

    this.listService.getUserList().subscribe({
      next: (res: any) => {
        this.isLoadingUsers = false;
        if (res?.success && Array.isArray(res.data)) {
          this.users = res.data.filter((user: any) =>
            user?.isVerified !== false && this.getUserId(user) !== this.currentUserId
          );
        } else {
          const errorMessage = res?.message || 'Unable to load users.';
          this.shareUsersError = errorMessage;
          this.toastr.error(errorMessage);
        }
      },
      error: (err: any) => {
        this.isLoadingUsers = false;
        const errorMessage = err?.error?.message || 'Unable to load users.';
        this.shareUsersError = errorMessage;
        this.toastr.error(errorMessage);
      }
    });
  }

  getUserId(user: any): string | null {
    const userId = typeof user === 'string' ? user : user?._id || user?.id;
    return userId ? userId.toString() : null;
  }

  toggleShareRecipient(userId: string | null, checked: boolean): void {
    if (!userId) return;
    this.selectedUserIds = checked
      ? [...new Set([...this.selectedUserIds, userId])]
      : this.selectedUserIds.filter((selectedId) => selectedId !== userId);
  }

  onRecipientChange(event: Event, user: any): void {
    this.toggleShareRecipient(this.getUserId(user), (event.target as HTMLInputElement).checked);
  }

  saveSharing(): void {
    const checklistId = this.shareDetails?._id;
    if (!checklistId || this.isSavingShare) return;

    this.isSavingShare = true;
    this.listService.sharePrivateChecklist(checklistId, this.selectedUserIds).subscribe({
      next: (res: any) => {
        this.isSavingShare = false;
        if (res?.success) {
          this.closeShareModal();
          this.toastr.success(res?.message || 'Checklist sharing updated successfully');
          this.getLists(false);
        } else {
          this.toastr.error(res?.message || 'Unable to update checklist sharing.');
        }
      },
      error: (err: any) => {
        this.isSavingShare = false;
        this.toastr.error(err?.error?.message || 'Unable to update checklist sharing.');
      }
    });
  }

  closeShareModal(): void {
    this.shareDetails = null;
    this.selectedUserIds = [];
    this.shareUsersError = null;
    $('#shareChecklistModal').modal('hide');
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
  }
}