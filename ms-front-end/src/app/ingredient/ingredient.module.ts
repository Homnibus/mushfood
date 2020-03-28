import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {IngredientQuantityListComponent} from './ingredient-quantity-list/ingredient-quantity-list.component';
import {IngredientQuantityDetailsComponent} from './ingredient-quantity-details/ingredient-quantity-details.component';
import {IngredientQuantityAddComponent} from './ingredient-quantity-add/ingredient-quantity-add.component';


@NgModule({
  declarations: [
    IngredientQuantityListComponent,
    IngredientQuantityDetailsComponent,
    IngredientQuantityAddComponent
  ],
  imports: [
    SharedModule,
  ],
  exports: [IngredientQuantityListComponent, IngredientQuantityDetailsComponent, IngredientQuantityAddComponent],
})
export class IngredientModule {
}
