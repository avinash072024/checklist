import { Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListService } from '../../services/list/list.service';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, Location } from '@angular/common';
import { CapitalizeFirstDirective } from '../../directives/capitalize-first.directive';

@Component({
  selector: 'app-view-checklist',
  imports: [FormsModule, CommonModule, CapitalizeFirstDirective],
  templateUrl: './view-checklist.component.html',
  styleUrl: './view-checklist.component.scss'
})
export class ViewChecklistComponent implements OnInit {
  itemTextInput = viewChild<ElementRef<HTMLInputElement>>('itemInputBox');

  id!: any;
  checklistDetails: any;
  listName = '';
  newItemName = '';

  listService = inject(ListService);
  sessionService = inject(SessionService);
  toastr = inject(ToastrService);
  location = inject(Location);

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.getChecklistById(this.id);
  }

  // getListById(): void {
  //   this.listService.getChecklistById(this.id).subscribe({
  //     next: (res: any) => {
  //       if (res?.success) {
  //         console.log('result: ', res?.data);
  //         this.checklistDetails = res?.data;
  //       }
  //     },
  //     error: (err: any) => {

  //     }
  //   })
  // }

  addListItem(): void {
    const itemText = this.newItemName.trim();
    if (!itemText) return;

    // const listDetailsString = this.sessionService.getSession(Constants.listDetails);
    // if (!listDetailsString) return;

    // const listDetails = JSON.parse(listDetailsString);

    this.listService.addItemToChecklist(this.id, itemText).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.getChecklistById(this.id);
          this.toastr.success(res?.message);
          this.newItemName = '';
          // Refresh list items from the updated checklist response
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
          this.checklistDetails = res?.data;
          console.log('this.checklistDetails: ', this.checklistDetails)
        }
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || err?.message);
      }
    });
  }

  deleteItem(itemId: string): void {
    this.listService.deleteChecklistItem(this.id, itemId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toastr.success(res?.message);
          this.getChecklistById(this.id);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err) => {
        this.toastr.error(err?.message);
      }
    })
  }

  back(): void {
    this.location.back();
  }

  completeListItem(itemId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    this.listService.toggleItemComplete(this.id, itemId, isChecked).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toastr.success(res?.message);
          this.getChecklistById(this.id);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.message);
      }
    })
  }

  freezeChecklist(): void {
    this.listService.freezeChecklist(this.id, true).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toastr.success(res?.message);
          this.getChecklistById(this.id);
        } else {
          this.toastr.error(res?.message);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.message);
      }
    })
  }
}