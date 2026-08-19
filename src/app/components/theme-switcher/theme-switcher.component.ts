import { Component, inject, OnInit } from '@angular/core';
import { SessionService } from '../../services/session/session.service';
import { Constants } from '../../models/constants';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent implements OnInit {
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
