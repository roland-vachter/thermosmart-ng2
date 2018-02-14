import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatingTargetComponent } from './heating-target.component';

describe('HeatingTargetComponent', () => {
  let component: HeatingTargetComponent;
  let fixture: ComponentFixture<HeatingTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatingTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatingTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
