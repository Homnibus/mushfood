import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {IngredientQuantity, Recipe} from '../../app.models';
import {Observable} from 'rxjs';
import {RecipeService} from './recipe.service';
import {map, switchMap} from 'rxjs/operators';
import {IngredientQuantityService} from '../../ingredient/services/ingredient-quantity.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeIngredientQuantityResolver implements Resolve<{ recipe: Recipe, ingredientQuantityList: IngredientQuantity[] }> {

  constructor(private recipeService: RecipeService,
              private ingredientQuantityService: IngredientQuantityService,) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{
    recipe: Recipe,
    ingredientQuantityList: IngredientQuantity[]
  }> {
    return this.recipeService.setActiveRecipe(route.paramMap.get('slug')).pipe(
      switchMap(recipe =>
        this.ingredientQuantityService.setActiveIngredientQuantityList(recipe).pipe(
          map(ingredientQuantityList => {
              return {recipe, ingredientQuantityList};
            }
          ),
        )
      )
    );
  }

}
