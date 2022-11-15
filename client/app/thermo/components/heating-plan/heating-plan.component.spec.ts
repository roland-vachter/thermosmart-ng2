import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeatingPlanComponent } from './heating-plan.component';

describe('HeatingPlanComponent', () => {
  let component: HeatingPlanComponent;
  let fixture: ComponentFixture<HeatingPlanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatingPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatingPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
