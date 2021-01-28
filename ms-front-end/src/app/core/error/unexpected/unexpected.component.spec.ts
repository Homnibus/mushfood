import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {UnexpectedComponent} from './unexpected.component';

describe('UnexpectedComponent', () => {
  let component: UnexpectedComponent;
  let fixture: ComponentFixture<UnexpectedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UnexpectedComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnexpectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
