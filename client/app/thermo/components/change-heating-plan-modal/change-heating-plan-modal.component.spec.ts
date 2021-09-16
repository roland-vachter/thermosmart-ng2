import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeHeatingPlanModalComponent } from './change-heating-plan-modal.component';

describe('ChangeHeatingPlanModalComponent', () => {
  let component: ChangeHeatingPlanModalComponent;
  let fixture: ComponentFixture<ChangeHeatingPlanModalComponent>;

  beforeEach(async(() => {
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
