import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatisticsModalComponent } from './statistics-modal.component';

describe('StatisticsModalComponent', () => {
  let component: StatisticsModalComponent;
  let fixture: ComponentFixture<StatisticsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
