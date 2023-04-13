import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {IngredientGroup} from '../../app.models';
import {Observable} from 'rxjs';
import {first, switchMap, tap} from 'rxjs/operators';
import {RecipeService} from '../../recipe/services/recipe.service';
import {IngredientGroupService} from './ingredient-group.service';


@Injectable({
  providedIn: 'root'
})
export class IngredientGroupResolver implements Resolve<IngredientGroup[]> {

  constructor(private recipeService: RecipeService,
              private ingredientGroupService: IngredientGroupService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IngredientGroup[]> {
    return this.recipeService.activeRecipe$.pipe(
      first(),
      switchMap(recipe => this.ingredientGroupService.setActiveIngredientGroupList(recipe))
    );
  }
}
