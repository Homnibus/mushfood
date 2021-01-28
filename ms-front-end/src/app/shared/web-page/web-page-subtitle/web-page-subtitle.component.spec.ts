import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {WebPageSubtitleComponent} from './web-page-subtitle.component';

describe('WebPageSubtitleComponent', () => {
  let component: WebPageSubtitleComponent;
  let fixture: ComponentFixture<WebPageSubtitleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WebPageSubtitleComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebPageSubtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
