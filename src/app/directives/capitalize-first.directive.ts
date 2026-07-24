import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCapitalizeFirst]'
})
export class CapitalizeFirstDirective {

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private control: NgControl
  ) { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const value = this.el.nativeElement.value;
    if (!value) return;

    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);

    // Update the visual DOM input value
    this.el.nativeElement.value = capitalized;

    // Update Angular NgModel or Reactive Forms control value
    if (this.control?.control) {
      this.control.control.setValue(capitalized, { emitEvent: false });
    }
  }

}
