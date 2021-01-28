import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {WebPageActionMenuComponent} from './web-page-action-menu.component';

describe('WebPageActionMenuComponent', () => {
  let component: WebPageActionMenuComponent;
  let fixture: ComponentFixture<WebPageActionMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WebPageActionMenuComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebPageActionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
