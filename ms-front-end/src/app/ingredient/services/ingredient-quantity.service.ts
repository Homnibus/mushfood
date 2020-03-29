import {ModelService} from '../../core/services/model.service';
import {Ingredient, IngredientQuantity} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {IngredientQuantitySerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IngredientQuantityService extends ModelService<IngredientQuantity> {

  constructor(authService: AuthService) {
    super(
      authService,
      IngredientQuantity,
      new IngredientQuantitySerializer()
    );
  }

  filterIngredientList(ingredient: Ingredient | string, ingredientList: Ingredient[]): Ingredient[] {
    let filterValue = '';
    if (ingredient) {
      if (ingredient instanceof Ingredient) {
        filterValue = ingredient.name.trim().toLowerCase();
      } else {
        filterValue = ingredient.trim().toLowerCase();
      }
    }
    return ingredientList.filter(toFilterIngredient => toFilterIngredient?.name.toLowerCase().includes(filterValue));
  }

  displayIngredient(ingredient?: Ingredient): string | undefined {
    return ingredient ? ingredient.name : undefined;
  }


}
