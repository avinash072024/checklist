import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { CapitalizeFirstDirective } from './capitalize-first.directive';

describe('CapitalizeFirstDirective', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      providers: [
        CapitalizeFirstDirective,
        { provide: ElementRef, useValue: new ElementRef(document.createElement('input')) },
        { provide: NgControl, useValue: { control: null } }
      ]
    });

    const directive = TestBed.inject(CapitalizeFirstDirective);
    expect(directive).toBeTruthy();
  });
});
