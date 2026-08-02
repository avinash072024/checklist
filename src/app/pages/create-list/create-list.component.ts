import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CapitalizeFirstDirective } from '../../directives/capitalize-first.directive';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { SocketService } from '../../services/socket/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-list',
  imports: [FormsModule, CommonModule, CapitalizeFirstDirective, RouterLink, BackButtonComponent],
  templateUrl: './create-list.component.html',
  styleUrl: './create-list.component.scss'
})
export class CreateListComponent implements OnInit, OnDestroy {
  itemTextInput = viewChild<ElementRef<HTMLInputElement>>('itemInputBox');
  listService = inject(ListService);
  socketService = inject(SocketService);
  toastr = inject(ToastrService);
  sessionService = inject(SessionService);
  router = inject(Router);

  isSubmitting = signal(false);

  listItems: any[] = [];
  listName = '';
  newItemName = '';
  autoRedirectUrl: string = '';

  stepOne: boolean = true;
  stepTwo: boolean = false;
  listDetails: any;

  private socketSub!: Subscription;
  listPrivate: boolean = false;

  ngOnInit(): void {
    const listDetailsString = this.sessionService.getSession(Constants.listDetails);
    if (listDetailsString) {
      try {
        this.listDetails = JSON.parse(listDetailsString);
        if (this.listDetails && this.listDetails._id) {
          this.listName = this.listDetails.title || '';
          this.stepOne = false;
          this.stepTwo = true;
          this.listPrivate = this.listDetails.isPrivate;
          this.autoRedirectUrl = this.listPrivate ? '/lists/private-lists' : '/lists/my-lists';
          this.getChecklistById(this.listDetails._id);
        }
      } catch (e) {
        console.error('Error parsing session listDetails:', e);
      }
    }

    // Listen for WebSocket real-time changes across all lists
    this.socketSub = this.socketService.onChecklistChange().subscribe((data) => {
      if (this.listDetails && this.listDetails._id) {
        if (!data.checklistId || data.checklistId === this.listDetails._id) {
          this.getChecklistById(this.listDetails._id);
        }
      }
    });
  }

  getIsPrivateStatus(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    this.listPrivate = isChecked;
  }

  enableStepTwo(): void {
    const listName = this.listName.trim();
    if (!listName) {
      this.toastr.warning('Please enter a list name');
      return;
    }

    // const payload = {
    //   title: listName
    // };

    const payload = {
      title: listName,
      isPrivate: this.listPrivate, // true if checked
    };

    this.isSubmitting.set(true);
    this.listService.createChecklist(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.isSubmitting.set(false);
          this.toastr.success(res?.message);
          this.autoRedirectUrl = this.listPrivate ? '/lists/private-lists' : '/lists/my-lists';
          this.listPrivate = false;
          this.listDetails = res?.data;
          this.sessionService.setSession(Constants.listDetails, JSON.stringify(res?.data));
          this.stepOne = false;
          this.stepTwo = true;
          this.listItems = res?.data?.listItems || [];
          if (this.listDetails?._id) {
            this.getChecklistById(this.listDetails._id);
          }
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.toastr.error(err?.error?.message || err?.message);
      }
    });
  }

  addListItem(): void {
    const itemText = this.newItemName.trim();
    if (!itemText) return;

    if (!this.listDetails || !this.listDetails._id) {
      const listDetailsString = this.sessionService.getSession(Constants.listDetails);
      if (listDetailsString) {
        try {
          this.listDetails = JSON.parse(listDetailsString);
        } catch (e) { }
      }
    }

    if (!this.listDetails || !this.listDetails._id) return;

    this.listService.addItemToChecklist(this.listDetails._id, itemText).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.newItemName = '';
          this.toastr.success(res?.message);
          this.getChecklistById(this.listDetails._id);
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
    if (!checklistId) return;
    this.listService.getChecklistById(checklistId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.listDetails = res.data;
          this.listItems = res.data?.listItems || [];
        }
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || err?.message);
      }
    });
  }

  deleteItem(itemId: string): void {
    if (!this.listDetails || !this.listDetails._id) return;
    this.listService.deleteChecklistItem(this.listDetails._id, itemId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toastr.success(res?.message);
          this.getChecklistById(this.listDetails._id);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err) => {
        this.toastr.error(err?.message);
      }
    });
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
    const session = this.sessionService.getSession(Constants.listDetails);
    if (session) {
      this.sessionService.removeItem(Constants.listDetails);
    }
  }
}