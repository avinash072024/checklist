import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CapitalizeFirstDirective } from '../../directives/capitalize-first.directive';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';

interface Items {
  id: number;
  itemName: string;
  isCheck: boolean;
}

@Component({
  selector: 'app-create-list',
  imports: [FormsModule, CommonModule, CapitalizeFirstDirective],
  templateUrl: './create-list.component.html',
  styleUrl: './create-list.component.scss'
})
export class CreateListComponent {
  mobileInput = viewChild<ElementRef<HTMLInputElement>>('itemInputBox');
  listService = inject(ListService);
  toastr = inject(ToastrService);
  sessionService = inject(SessionService);

  listItems: any[] = [];
  listName = '';
  newItemName = '';

  editingId: number | null = null;
  editItemName = '';

  stepOne: boolean = true;
  stepTwo: boolean = false;

  enableStepTwo(): void {
    const listName = this.listName.trim();
    if (!listName) return;

    if (listName) {
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
          } else {
            this.stepOne = true;
            this.stepTwo = false;
            this.toastr.error(res?.message);
          }
        },
        error: (err: any) => {
          this.stepOne = true;
          this.stepTwo = false;
          this.toastr.error(err?.message);
        }
      })
    }
  }

  updateChecklist(): void {
    debugger;
    const listDetailsString = this.sessionService.getSession(Constants.listDetails);

    if (!listDetailsString) {
      return;
    }

    const listDetails = JSON.parse(listDetailsString);

    const payload = {
      id: listDetails._id,
      title: listDetails.title,
      listItems: [
        {
          ...this.listItems
        }
      ]
    };

    this.listService.updateChecklist(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toastr.success(res?.message);
          this.stepOne = true;
          this.stepTwo = false;
        } else {
          this.toastr.error(res?.message);
          this.stepOne = true;
          this.stepTwo = false;
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.message);
        this.stepOne = true;
        this.stepTwo = false;
      }
    })
  }

  addItem(): void {
    const item = this.newItemName.trim();

    if (!item) return;

    const isDuplicate = this.listItems.some(
      existingItem => existingItem.itemName.toLowerCase() === item.toLowerCase()
    );

    if (isDuplicate) {
      // Optional: Add user notification here (e.g., toast, alert, or error flag)
      console.warn('Item already exists in the list!');
      return;
    }

    this.listItems.push({
      // id: Date.now(),
      // itemName: item,
      // isCheck: false
      text: item
    });

    this.newItemName = '';
    this.mobileInput()?.nativeElement.focus();
  }

  deleteItem(id: number): void {
    this.listItems = this.listItems.filter(item => item.id !== id);
  }

  startEdit(item: Items): void {
    this.editingId = item.id;
    this.editItemName = item.itemName;
  }

  updateItem(): void {
    if (this.editingId === null) return;

    const item = this.listItems.find(x => x.id === this.editingId);

    if (item) {
      item.itemName = this.editItemName.trim();
      item.isCheck = item.isCheck;
    }

    this.cancelEdit();
  }

  updateStatus(item: Items, event: any): void {
    const element = event.target as HTMLInputElement;

    if (item.id === null) return;

    const selectedItem = this.listItems.find(x => x.id === item.id);

    if (selectedItem) {
      item.isCheck = element.checked;
    }

  }

  cancelEdit(): void {
    this.editingId = null;
    this.editItemName = '';
  }
}
