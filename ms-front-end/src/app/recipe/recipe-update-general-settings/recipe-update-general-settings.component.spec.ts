import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeUpdateGeneralSettingsComponent} from './recipe-update-general-settings.component';

describe('RecipeUpdateGeneralSettingsComponent', () => {
  let component: RecipeUpdateGeneralSettingsComponent;
  let fixture: ComponentFixture<RecipeUpdateGeneralSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeUpdateGeneralSettingsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeUpdateGeneralSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
