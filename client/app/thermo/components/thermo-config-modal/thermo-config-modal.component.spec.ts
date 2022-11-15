import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThermoConfigModalComponent } from './thermo-config-modal.component';

describe('ThermoConfigModalComponent', () => {
  let component: ThermoConfigModalComponent;
  let fixture: ComponentFixture<ThermoConfigModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThermoConfigModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThermoConfigModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
