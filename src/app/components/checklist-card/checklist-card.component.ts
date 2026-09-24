import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checklist-card',
  imports: [DatePipe, NgClass],
  templateUrl: './checklist-card.component.html',
  styleUrl: './checklist-card.component.scss'
})
export class ChecklistCardComponent {

  private listService = inject(ListService);

  /** Prevents duplicate download requests */
  isDownloading = false;

  /** The checklist item data */
  @Input() item: any;

  /**
   * Card colour variant.
   * 'primary' (default) → blue  (lists / my-lists / other-lists)
   * 'warning'           → yellow (private-lists)
   */
  @Input() variant: 'primary' | 'warning' = 'primary';

  /**
   * Icon shown in the card header icon-box.
   * Defaults to 'bi-globe2'; private lists use 'bi-lock-fill'.
   */
  @Input() icon: string = 'bi-globe2';

  /**
   * Created-By label resolved from the parent (e.g. "You" or a full name).
   * When undefined, the row is hidden (used for private lists).
   */
  @Input() createdByLabel: string | undefined;

  /**
   * Whether to show the Delete button.
   * Parent decides based on ownership or list type.
   */
  @Input() showDelete: boolean = true;

  /**
   * Emitted when the user clicks the Delete button.
   * Parent opens the confirmation modal.
   */
  @Output() deleteClicked = new EventEmitter<void>();

  /**
   * Emitted when the user clicks the View button.
   */
  @Output() viewClicked = new EventEmitter<void>();

  toastr = inject(ToastrService);

  get activeCardClass(): string {
    return this.variant === 'warning' ? 'warning-card' : '';
  }

  get iconBoxClass(): string {
    if (this.item?.isFreeze) return 'bg-danger-subtle text-danger';
    return this.variant === 'warning'
      ? 'bg-warning-subtle text-warning'
      : 'bg-primary-subtle text-primary';
  }

  get badgeClass(): string {
    if (this.item?.isFreeze) return 'bg-danger-subtle text-danger';
    return this.variant === 'warning'
      ? 'bg-warning-subtle text-warning'
      : 'bg-success-subtle text-success';
  }

  get progressBarClass(): string {
    if (this.item?.isFreeze) return 'bg-danger';
    return this.variant === 'warning' ? 'bg-warning' : 'bg-primary';
  }

  get viewBtnClass(): string {
    if (this.variant === 'warning') {
      return this.item?.isPrivate ? 'btn-warning text-dark' : 'btn-outline-primary';
    }
    return 'btn-primary';
  }

  get progressPercent(): number {
    return this.item?.totalItems
      ? (this.item.completedItems / this.item.totalItems) * 100
      : 0;
  }

  downloadPdf(): void {
    if (!this.item?._id || this.isDownloading) return;
    this.isDownloading = true;

    this.listService.downloadChecklistPdf(this.item._id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${this.item?.title || 'checklist'}.pdf`;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
        this.toastr.success('Checklist downloaded successfully');
      },
      error: () => {
        this.isDownloading = false;
        this.toastr.error('Failed to download checklist');
      }
    });
  }
}
