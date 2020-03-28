import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeUpdateIngredientComponent} from './recipe-update-ingredient.component';

describe('RecipeUpdateIngredientComponent', () => {
  let component: RecipeUpdateIngredientComponent;
  let fixture: ComponentFixture<RecipeUpdateIngredientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeUpdateIngredientComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeUpdateIngredientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
