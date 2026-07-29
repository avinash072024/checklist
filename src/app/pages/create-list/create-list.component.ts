// import { CommonModule } from '@angular/common';
// import { Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CapitalizeFirstDirective } from '../../directives/capitalize-first.directive';
// import { ListService } from '../../services/list/list.service';
// import { ToastrService } from 'ngx-toastr';
// import { SessionService } from '../../services/session/session.service';
// import { Constants } from '../../models/constants';
// import { Checklist } from '../../models/checklist.model';

// interface Items {
//   id: number;
//   itemName: string;
//   isCheck: boolean;
// }

// @Component({
//   selector: 'app-create-list',
//   imports: [FormsModule, CommonModule, CapitalizeFirstDirective],
//   templateUrl: './create-list.component.html',
//   styleUrl: './create-list.component.scss'
// })
// export class CreateListComponent implements OnDestroy {
//   itemTextInput = viewChild<ElementRef<HTMLInputElement>>('itemInputBox');
//   listService = inject(ListService);
//   toastr = inject(ToastrService);
//   sessionService = inject(SessionService);

//   listItems: any[] = [];
//   listName = '';
//   newItemName = '';

//   editingId: number | null = null;
//   editItemName = '';



//   checklistId!: string;
//   checklist: Checklist | null = null;
//   newItemText: string = '';

//   isLoading = false;
//   isAdding = false;
//   errorMessage = '';
//   successMessage = '';



//   stepOne: boolean = true;
//   stepTwo: boolean = false;

//   enableStepTwo(): void {
//     const listName = this.listName.trim();
//     if (!listName) return;

//     if (listName) {
//       const payload = {
//         title: listName
//       }
//       this.listService.createChecklist(payload).subscribe({
//         next: (res: any) => {
//           if (res.success) {
//             this.toastr.success(res?.message);
//             this.sessionService.setSession(Constants.listDetails, JSON.stringify(res?.data));
//             this.stepOne = false;
//             this.stepTwo = true;
//           } else {
//             this.stepOne = true;
//             this.stepTwo = false;
//             this.toastr.error(res?.message);
//           }
//         },
//         error: (err: any) => {
//           this.stepOne = true;
//           this.stepTwo = false;
//           this.toastr.error(err?.message);
//         }
//       })
//     }
//   }

//   updateChecklist(): void {
//     debugger;
//     const listDetailsString = this.sessionService.getSession(Constants.listDetails);

//     if (!listDetailsString) {
//       return;
//     }

//     const listDetails = JSON.parse(listDetailsString);

//     const payload = {
//       id: listDetails._id,
//       title: listDetails.title,
//       listItems: [
//         {
//           ...this.listItems
//         }
//       ],
//       isFreeze: listDetails.isFreeze
//     };

//     this.listService.updateChecklist(payload.id, payload).subscribe({
//       next: (res: any) => {
//         if (res?.success) {
//           this.toastr.success(res?.message);
//           this.stepOne = true;
//           this.stepTwo = false;
//         } else {
//           this.toastr.error(res?.message);
//           this.stepOne = true;
//           this.stepTwo = false;
//         }
//       },
//       error: (err: any) => {
//         this.toastr.error(err?.message);
//         this.stepOne = true;
//         this.stepTwo = false;
//       }
//     })
//   }

//   addListItem(): void {
//     debugger;
//     const listDetailsString = this.sessionService.getSession(Constants.listDetails);

//     if (!listDetailsString) {
//       return;
//     }

//     const listDetails = JSON.parse(listDetailsString);

//     this.listService.addItemToChecklist(listDetails._id, this.newItemName).subscribe({
//       next: (res: any) => {
//         debugger;
//         if (res?.success) {
//           this.getChecklistById(listDetails?._id);
//           this.toastr.success(res?.message);
//           this.newItemName = '';
//           this.itemTextInput()?.nativeElement.focus();
//         } else {
//           this.toastr.error(res?.message);
//           this.itemTextInput()?.nativeElement.focus();
//         }
//       },
//       error: (err: any) => {
//         this.toastr.error(err?.message);
//         this.itemTextInput()?.nativeElement.focus();
//       }
//     })
//   }

//   getChecklistById(checklistId: string): void {
//     debugger;
//     this.listService.getChecklistById(checklistId).subscribe({
//       next: (res: any) => {
//         if (res?.success) {
//           // this.listItems = res?.data;
//           this.checklist = res.data;
//           console.log('this.checklist', this.checklist);
//         }
//       },
//       error: (err) => {
//         this.toastr.error(err?.message);
//       }
//     })
//   }

//   addItem(): void {
//     const item = this.newItemName.trim();

//     if (!item) return;

//     const isDuplicate = this.listItems.some(
//       existingItem => existingItem.itemName.toLowerCase() === item.toLowerCase()
//     );

//     if (isDuplicate) {
//       // Optional: Add user notification here (e.g., toast, alert, or error flag)
//       console.warn('Item already exists in the list!');
//       return;
//     }

//     this.listItems.push({
//       id: Date.now(),
//       // itemName: item,
//       // isCheck: false
//       text: item
//     });

//     this.newItemName = '';
//     this.itemTextInput()?.nativeElement.focus();
//   }

//   deleteItem(id: number): void {
//     this.listItems = this.listItems.filter(item => item.id !== id);
//   }

//   startEdit(item: Items): void {
//     this.editingId = item.id;
//     this.editItemName = item.itemName;
//   }

//   updateItem(): void {
//     if (this.editingId === null) return;

//     const item = this.listItems.find(x => x.id === this.editingId);

//     if (item) {
//       item.itemName = this.editItemName.trim();
//       item.isCheck = item.isCheck;
//     }

//     this.cancelEdit();
//   }

//   updateStatus(item: Items, event: any): void {
//     const element = event.target as HTMLInputElement;

//     if (item.id === null) return;

//     const selectedItem = this.listItems.find(x => x.id === item.id);

//     if (selectedItem) {
//       item.isCheck = element.checked;
//     }

//   }

//   cancelEdit(): void {
//     this.editingId = null;
//     this.editItemName = '';
//   }

//   // Called automatically before the component is removed from the DOM
//   ngOnDestroy() {
//     const session = this.sessionService.getSession(Constants.listDetails);
//     if (session) {
//       this.sessionService.removeItem(Constants.listDetails);
//     }
//   }
// }
























import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CapitalizeFirstDirective } from '../../directives/capitalize-first.directive';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { Checklist } from '../../models/checklist.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-list',
  imports: [FormsModule, CommonModule, CapitalizeFirstDirective],
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

  // Since items are added immediately via addListItem(), 
  // "Done" simply finalizes the creation workflow and resets.
  onFinishList(): void {
    const session = this.sessionService.getSession(Constants.listDetails);
    if (session) {
      this.sessionService.removeItem(Constants.listDetails);
    }
    this.toastr.success('List created successfully!');
    this.stepOne = true;
    this.stepTwo = false;
    this.listName = '';
    this.listItems = [];
    // Optional: navigate somewhere else if needed
    // this.router.navigate(['/checklists']);
  }

  addListItem(): void {
    const itemText = this.newItemName.trim();
    if (!itemText) return;

    const listDetailsString = this.sessionService.getSession(Constants.listDetails);
    if (!listDetailsString) return;

    const listDetails = JSON.parse(listDetailsString);

    this.listService.addItemToChecklist(listDetails._id, itemText).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.getChecklistById(listDetails._id);
          this.toastr.success(res?.message);
          this.newItemName = '';
          // Refresh list items from the updated checklist response
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

  ngOnDestroy() {
    const session = this.sessionService.getSession(Constants.listDetails);
    if (session) {
      this.sessionService.removeItem(Constants.listDetails);
    }
  }
}