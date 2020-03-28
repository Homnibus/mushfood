import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {IngredientQuantityAddComponent} from './ingredient-quantity-add.component';

describe('IngredientQuantityAddComponent', () => {
  let component: IngredientQuantityAddComponent;
  let fixture: ComponentFixture<IngredientQuantityAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IngredientQuantityAddComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngredientQuantityAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
