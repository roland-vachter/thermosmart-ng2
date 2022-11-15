import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeatingCurrentPlanComponent } from './heating-current-plan.component';

describe('HeatingCurrentPlanComponent', () => {
  let component: HeatingCurrentPlanComponent;
  let fixture: ComponentFixture<HeatingCurrentPlanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatingCurrentPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatingCurrentPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
