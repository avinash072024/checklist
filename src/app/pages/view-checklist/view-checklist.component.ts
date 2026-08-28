import { Component, ElementRef, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListService } from '../../services/list/list.service';
import { SocketService } from '../../services/socket/socket.service';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session/session.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { CapitalizeFirstDirective } from '../../directives/capitalize-first.directive';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { Subscription } from 'rxjs';
import { NotFoundCardComponent } from '../../components/not-found-card/not-found-card.component';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonTopSectionComponent } from "../../components/common-top-section/common-top-section.component";

@Component({
  selector: 'app-view-checklist',
  imports: [FormsModule, CommonModule, CapitalizeFirstDirective, BackButtonComponent, NotFoundCardComponent, DragDropModule, CommonTopSectionComponent],
  templateUrl: './view-checklist.component.html',
  styleUrl: './view-checklist.component.scss'
})
export class ViewChecklistComponent implements OnInit, OnDestroy {
  itemTextInput = viewChild<ElementRef<HTMLInputElement>>('itemInputBox');

  checkListId!: any;
  checklistDetails: any;
  listName = '';
  newItemName = '';
  deleteDetails: any;
  heading!: string;
  subHeading!: string;

  listService = inject(ListService);
  socketService = inject(SocketService);
  sessionService = inject(SessionService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);

  private socketSub!: Subscription;

  constructor(private route: ActivatedRoute) {
    this.checkListId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.getChecklistById(this.checkListId, true);

    // Listen to real-time events and update if this checklist or item was modified
    this.socketSub = this.socketService.onChecklistChange().subscribe((data) => {
      if (!data.checklistId || data.checklistId === this.checkListId) {
        this.getChecklistById(this.checkListId, false);
      }
    });
    this.heading = !this.checklistDetails?.isPrivate ? `View Checklist (Private)` : `View Checklist`;
    this.subHeading = this.checklistDetails?.freeze ? "`The checklist is completed, now you can't modify the list.`" : 'You can add items here until the list is complete.';
  }

  addListItem(): void {
    const itemText = this.newItemName.trim();
    // if (!itemText) return;
    if (!itemText) {
      this.toastr.error('Please enter item name');
      return;
    }

    this.listService.addItemToChecklist(this.checkListId, itemText).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toastr.success(res?.message);
          this.newItemName = '';
          this.itemTextInput()?.nativeElement.focus();
        } else {
          this.toastr.error(res?.message);
          this.itemTextInput()?.nativeElement.focus();
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || err?.message);
        this.itemTextInput()?.nativeElement.focus();
      }
    });
  }

  getChecklistById(checklistId: string, showSpinner: boolean): void {
    if (showSpinner) {
      this.spinner.show();
    }

    this.listService.getChecklistById(checklistId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.checklistDetails = res?.data || [];
          this.heading = this.checklistDetails?.isPrivate ? `View Checklist (Private)` : `View Checklist`;
          this.subHeading = this.checklistDetails?.freeze ? "`The checklist is completed, now you can't modify the list.`" : 'You can add items here until the list is complete.';
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      },
      error: (err) => {
        this.checklistDetails = [];
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Something went wrong.');
      }
    });
  }

  deleteItem(itemId: string): void {
    this.listService.deleteChecklistItem(this.checkListId, itemId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toastr.success(res?.message);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err) => {
        this.toastr.error(err?.message);
      }
    });
  }

  completeListItem(itemId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    this.listService.toggleItemComplete(this.checkListId, itemId, isChecked).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toastr.success(res?.message);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.message);
      }
    });
  }

  freezeChecklist(): void {
    this.listService.freezeChecklist(this.checkListId, true).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.closeModal();
          this.toastr.success(res?.message);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.message);
      }
    });
  }

  openModal(data: any): void {
    this.deleteDetails = data;
    $('#staticBackdrop').modal('show');
  }

  closeModal(): void {
    this.deleteDetails = null;
    $('#staticBackdrop').modal('hide');
  }

  // Add this drop handler method
  drop(event: CdkDragDrop<any[]>): void {
    if (this.checklistDetails?.isFreeze) return;

    // Locally reorder the array instantly for smooth UI feedback
    moveItemInArray(this.checklistDetails.listItems, event.previousIndex, event.currentIndex);

    // Extract the new order of IDs to send to your backend API
    const orderedIds = this.checklistDetails.listItems.map((item: any) => item._id);

    this.listService.reorderChecklistItems(this.checkListId, orderedIds).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.toastr.error(res?.message);
          // Revert locally if failed
          moveItemInArray(this.checklistDetails.listItems, event.currentIndex, event.previousIndex);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.message);
        // Revert locally if failed
        moveItemInArray(this.checklistDetails.listItems, event.currentIndex, event.previousIndex);
      }
    });
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
  }
}