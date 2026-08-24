import { Component, inject, Input, OnInit } from '@angular/core';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { ThemeService } from '../../services/theme/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-switcher',
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent implements OnInit {
  @Input() dynamicClass: string = '';
  currentTheme!: string;
  themeService = inject(ThemeService);
  sessionService = inject(SessionService);

  ngOnInit(): void {
    const theme = this.sessionService.getSession(Constants.THEME_KEY) || 'light';
    this.currentTheme = theme;
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme == 'dark' ? 'light' : 'dark';
    this.themeService.toggleTheme(this.currentTheme);
  }
}
