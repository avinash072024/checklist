import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChecklistButtonComponent } from './create-checklist-button.component';

describe('CreateChecklistButtonComponent', () => {
  let component: CreateChecklistButtonComponent;
  let fixture: ComponentFixture<CreateChecklistButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateChecklistButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateChecklistButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
