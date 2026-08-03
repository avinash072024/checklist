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
declare var $: any;

@Component({
  selector: 'app-view-checklist',
  imports: [FormsModule, CommonModule, CapitalizeFirstDirective, BackButtonComponent],
  templateUrl: './view-checklist.component.html',
  styleUrl: './view-checklist.component.scss'
})
export class ViewChecklistComponent implements OnInit, OnDestroy {
  itemTextInput = viewChild<ElementRef<HTMLInputElement>>('itemInputBox');

  id!: any;
  checklistDetails: any;
  listName = '';
  newItemName = '';
  deleteDetails: any;

  listService = inject(ListService);
  socketService = inject(SocketService);
  sessionService = inject(SessionService);
  toastr = inject(ToastrService);

  private socketSub!: Subscription;

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.getChecklistById(this.id);

    // Listen to real-time events and update if this checklist or item was modified
    this.socketSub = this.socketService.onChecklistChange().subscribe((data) => {
      if (!data.checklistId || data.checklistId === this.id) {
        this.getChecklistById(this.id);
      }
    });
  }

  addListItem(): void {
    const itemText = this.newItemName.trim();
    if (!itemText) return;

    this.listService.addItemToChecklist(this.id, itemText).subscribe({
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

  getChecklistById(checklistId: string): void {
    this.listService.getChecklistById(checklistId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.checklistDetails = res?.data;
        }
      },
      error: (err) => {
        // this.toastr.error(err?.error?.message || err?.message);
        // this.toastr.error(err?.message);
        this.toastr.error(err?.error?.message || 'Something went wrong.', err?.statusText);
      }
    });
  }

  deleteItem(itemId: string): void {
    this.listService.deleteChecklistItem(this.id, itemId).subscribe({
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

    this.listService.toggleItemComplete(this.id, itemId, isChecked).subscribe({
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
    this.listService.freezeChecklist(this.id, true).subscribe({
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

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
  }
}