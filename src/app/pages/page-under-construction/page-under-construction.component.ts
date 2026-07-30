import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-under-construction',
  imports: [CommonModule, FormsModule],
  templateUrl: './page-under-construction.component.html',
  styleUrl: './page-under-construction.component.scss'
})
export class PageUnderConstructionComponent {
  email = signal('');
  isSubmitted = signal(false);

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.email().trim()) {
      this.isSubmitted.set(true);
      // Handle backend API call here
    }
  }
}
