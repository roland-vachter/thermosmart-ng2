import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeHeatingPlanModalComponent } from './change-heating-plan-modal.component';

describe('ChangeHeatingPlanModalComponent', () => {
  let component: ChangeHeatingPlanModalComponent;
  let fixture: ComponentFixture<ChangeHeatingPlanModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeHeatingPlanModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeHeatingPlanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
