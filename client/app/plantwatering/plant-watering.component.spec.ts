import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlantWateringComponent } from './plant-watering.component';

describe('PlantwateringComponent', () => {
  let component: PlantWateringComponent;
  let fixture: ComponentFixture<PlantWateringComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantWateringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantWateringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
