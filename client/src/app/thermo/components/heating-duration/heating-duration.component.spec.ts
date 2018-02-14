import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatingDurationComponent } from './heating-duration.component';

describe('HeatingDurationComponent', () => {
  let component: HeatingDurationComponent;
  let fixture: ComponentFixture<HeatingDurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatingDurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatingDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
