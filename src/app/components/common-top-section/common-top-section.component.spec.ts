import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTopSectionComponent } from './common-top-section.component';

describe('CommonTopSectionComponent', () => {
  let component: CommonTopSectionComponent;
  let fixture: ComponentFixture<CommonTopSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonTopSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonTopSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
