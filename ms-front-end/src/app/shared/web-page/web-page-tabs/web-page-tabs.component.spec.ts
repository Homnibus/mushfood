import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {WebPageTabsComponent} from './web-page-tabs.component';

describe('WebPageTabsComponent', () => {
  let component: WebPageTabsComponent;
  let fixture: ComponentFixture<WebPageTabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WebPageTabsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebPageTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
