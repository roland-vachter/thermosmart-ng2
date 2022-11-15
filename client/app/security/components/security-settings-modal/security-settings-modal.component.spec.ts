import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SecuritySettingsModalComponent } from './security-settings-modal.component';

describe('SecuritySettingsModalComponent', () => {
  let component: SecuritySettingsModalComponent;
  let fixture: ComponentFixture<SecuritySettingsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SecuritySettingsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecuritySettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
