import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {IngredientQuantity} from '../../app.models';
import {Observable} from 'rxjs';
import {first, switchMap, tap} from 'rxjs/operators';
import {RecipeService} from '../../recipe/services/recipe.service';
import {IngredientQuantityService} from './ingredient-quantity.service';


@Injectable({
  providedIn: 'root'
})
export class IngredientQuantityResolver implements Resolve<IngredientQuantity[]> {

  constructor(private recipeService: RecipeService,
              private ingredientQuantityService: IngredientQuantityService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IngredientQuantity[]> {
    return this.recipeService.activeRecipe$.pipe(
      first(),
      switchMap(recipe => this.ingredientQuantityService.setActiveIngredientQuantityList(recipe))
    );
  }
}
