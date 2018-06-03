import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantwateringComponent } from './plantwatering.component';

describe('PlantwateringComponent', () => {
  let component: PlantwateringComponent;
  let fixture: ComponentFixture<PlantwateringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantwateringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantwateringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
