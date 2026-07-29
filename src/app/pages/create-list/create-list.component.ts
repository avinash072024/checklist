import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CapitalizeFirstDirective } from '../../directives/capitalize-first.directive';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { Checklist } from '../../models/checklist.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-list',
  imports: [FormsModule, CommonModule, CapitalizeFirstDirective, RouterLink],
  templateUrl: './create-list.component.html',
  styleUrl: './create-list.component.scss'
})
export class CreateListComponent implements OnDestroy {
  itemTextInput = viewChild<ElementRef<HTMLInputElement>>('itemInputBox');
  listService = inject(ListService);
  toastr = inject(ToastrService);
  sessionService = inject(SessionService);
  router = inject(Router);

  listItems: any[] = [];
  listName = '';
  newItemName = '';

  // checklist: Checklist | null = null;

  stepOne: boolean = true;
  stepTwo: boolean = false;
  listDetails: any;

  enableStepTwo(): void {
    const listName = this.listName.trim();
    if (!listName) {
      this.toastr.warning('Please enter a list name');
      return;
    }

    const payload = {
      title: listName
    }

    this.listService.createChecklist(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(res?.message);
          this.sessionService.setSession(Constants.listDetails, JSON.stringify(res?.data));
          this.stepOne = false;
          this.stepTwo = true;
          this.listItems = res?.data?.listItems || [];
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || err?.message);
      }
    });
  }

  addListItem(): void {
    const itemText = this.newItemName.trim();
    if (!itemText) return;

    const listDetailsString = this.sessionService.getSession(Constants.listDetails);
    if (!listDetailsString) return;

    this.listDetails = JSON.parse(listDetailsString);

    this.listService.addItemToChecklist(this.listDetails._id, itemText).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.getChecklistById(this.listDetails._id);
          this.toastr.success(res?.message);
          this.newItemName = '';
          this.listItems = res.data.listItems;
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
          // this.checklist = res.data;
          this.listItems = res.data.listItems;
        }
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || err?.message);
      }
    });
  }

  deleteItem(itemId: string): void {
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
    })
  }

  ngOnDestroy() {
    const session = this.sessionService.getSession(Constants.listDetails);
    if (session) {
      this.sessionService.removeItem(Constants.listDetails);
    }
  }
}