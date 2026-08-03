import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNotFoundCardComponent } from './list-not-found-card.component';

describe('ListNotFoundCardComponent', () => {
  let component: ListNotFoundCardComponent;
  let fixture: ComponentFixture<ListNotFoundCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListNotFoundCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListNotFoundCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
