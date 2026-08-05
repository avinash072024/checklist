import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  standalone: true,
  templateUrl: './scroll-top.component.html',
  styleUrls: ['./scroll-top.component.scss']
})
export class ScrollTopComponent {
  isBrowser: boolean = typeof window !== 'undefined';
  showScrollTop: boolean = false;

  scrollToTop() {
    if (!this.isBrowser) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser) return;
    const y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollTop = y > 300;
  }
}
