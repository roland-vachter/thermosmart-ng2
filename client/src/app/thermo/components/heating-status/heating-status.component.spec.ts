import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatingStatusComponent } from './heating-status.component';

describe('HeatingStatusComponent', () => {
  let component: HeatingStatusComponent;
  let fixture: ComponentFixture<HeatingStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatingStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatingStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
