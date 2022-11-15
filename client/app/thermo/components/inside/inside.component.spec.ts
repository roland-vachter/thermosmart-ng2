import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InsideComponent } from './inside.component';

describe('InsideComponent', () => {
  let component: InsideComponent;
  let fixture: ComponentFixture<InsideComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InsideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
