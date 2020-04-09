import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {IngredientQuantityDetailsComponent} from './ingredient-quantity-details/ingredient-quantity-details.component';
import {IngredientQuantityAddComponent} from './ingredient-quantity-add/ingredient-quantity-add.component';


@NgModule({
  declarations: [
    IngredientQuantityDetailsComponent,
    IngredientQuantityAddComponent
  ],
  imports: [
    SharedModule,
  ],
  exports: [IngredientQuantityDetailsComponent, IngredientQuantityAddComponent],
})
export class IngredientModule {
}
