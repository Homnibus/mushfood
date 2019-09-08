import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientQuantityDetailsComponent } from './ingredient-quantity-details.component';

describe('IngredientQuantityDetailsComponent', () => {
  let component: IngredientQuantityDetailsComponent;
  let fixture: ComponentFixture<IngredientQuantityDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngredientQuantityDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngredientQuantityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
