import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {WebPageTitleComponent} from './web-page-title.component';

describe('WebPageTitleComponent', () => {
  let component: WebPageTitleComponent;
  let fixture: ComponentFixture<WebPageTitleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WebPageTitleComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebPageTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
