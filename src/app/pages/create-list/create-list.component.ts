import { CommonModule } from '@angular/common';
import { Component, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CapitalizeFirstDirective } from '../../directives/capitalize-first.directive';

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

  listItems: Items[] = [];
  listName = '';
  newItemName = '';

  editingId: number | null = null;
  editItemName = '';

  stepOne: boolean = true;
  stepTwo: boolean = false;

  enableStepTwo(): void {
    const listName = this.listName.trim();
    if (!listName) return;
    this.stepOne = false;
    this.stepTwo = true;
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
      id: Date.now(),
      itemName: item,
      isCheck: false
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
    debugger;
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
