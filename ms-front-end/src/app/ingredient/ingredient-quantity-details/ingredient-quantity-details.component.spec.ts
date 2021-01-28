import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IngredientQuantityDetailsComponent } from './ingredient-quantity-details.component';

describe('IngredientQuantityDetailsComponent', () => {
  let component: IngredientQuantityDetailsComponent;
  let fixture: ComponentFixture<IngredientQuantityDetailsComponent>;

  beforeEach(waitForAsync(() => {
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
