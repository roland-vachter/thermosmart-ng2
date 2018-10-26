import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatingPowerComponent } from './heating-power.component';

describe('HeatingPowerComponent', () => {
  let component: HeatingPowerComponent;
  let fixture: ComponentFixture<HeatingPowerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatingPowerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatingPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
