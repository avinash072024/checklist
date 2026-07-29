import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import * as AOS from 'aos';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'to-do-list';

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out'
    });
  }
}
