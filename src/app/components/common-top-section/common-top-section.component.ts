import { Component, Input } from '@angular/core';
import { CreateChecklistButtonComponent } from "../create-checklist-button/create-checklist-button.component";
import { BackButtonComponent } from "../back-button/back-button.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-common-top-section',
  imports: [CreateChecklistButtonComponent, BackButtonComponent, CommonModule],
  templateUrl: './common-top-section.component.html',
  styleUrl: './common-top-section.component.scss'
})
export class CommonTopSectionComponent {
  @Input() heading!: string;
  @Input() subheading!: string;
  @Input() checklistCount!: number;
  @Input() showCreateButton: boolean = true;
}
