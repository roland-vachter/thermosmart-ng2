import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSensorLabelModalComponent } from './change-sensor-label-modal.component';

describe('ChangeSensorLabelModalComponent', () => {
  let component: ChangeSensorLabelModalComponent;
  let fixture: ComponentFixture<ChangeSensorLabelModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeSensorLabelModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSensorLabelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
