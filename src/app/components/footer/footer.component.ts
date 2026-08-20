import { Component } from '@angular/core';
import { Constants } from '../../models/constants';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  appName: string = Constants.appName;
}
