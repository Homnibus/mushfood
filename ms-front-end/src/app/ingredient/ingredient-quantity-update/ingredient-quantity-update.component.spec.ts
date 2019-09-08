import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientQuantityUpdateComponent } from './ingredient-quantity-update.component';

describe('IngredientQuantityUpdateComponent', () => {
  let component: IngredientQuantityUpdateComponent;
  let fixture: ComponentFixture<IngredientQuantityUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngredientQuantityUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngredientQuantityUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
