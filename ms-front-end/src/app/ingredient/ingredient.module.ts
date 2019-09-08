import {NgModule} from '@angular/core';
import {IngredientDetailsComponent} from './ingredient-details/ingredient-details.component';
import {SharedModule} from '../shared/shared.module';
import {IngredientQuantityListComponent} from './ingredient-quantity-list/ingredient-quantity-list.component';
import {IngredientQuantityUpdateComponent} from './ingredient-quantity-update/ingredient-quantity-update.component';
import {IngredientQuantityDetailsComponent} from './ingredient-quantity-details/ingredient-quantity-details.component';


@NgModule({
  declarations: [
    IngredientDetailsComponent,
    IngredientQuantityListComponent,
    IngredientQuantityUpdateComponent,
    IngredientQuantityDetailsComponent
  ],
  imports: [
    SharedModule,
  ],
  exports: [IngredientDetailsComponent, IngredientQuantityListComponent, IngredientQuantityUpdateComponent],
})
export class IngredientModule {
}
