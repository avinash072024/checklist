import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found-card',
  imports: [],
  templateUrl: './not-found-card.component.html',
  styleUrl: './not-found-card.component.scss'
})
export class NotFoundCardComponent {
  location = inject(Location);
}
