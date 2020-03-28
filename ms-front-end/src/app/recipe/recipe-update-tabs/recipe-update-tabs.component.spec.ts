import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeUpdateTabsComponent} from './recipe-update-tabs.component';

describe('RecipeUpdateTabsComponent', () => {
  let component: RecipeUpdateTabsComponent;
  let fixture: ComponentFixture<RecipeUpdateTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeUpdateTabsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeUpdateTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
