import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherListsComponent } from './other-lists.component';

describe('OtherListsComponent', () => {
  let component: OtherListsComponent;
  let fixture: ComponentFixture<OtherListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherListsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
