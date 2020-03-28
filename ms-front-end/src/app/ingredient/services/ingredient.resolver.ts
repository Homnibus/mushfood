import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Ingredient} from '../../app.models';
import {Observable} from 'rxjs';
import {RecipeUpdateService} from '../../recipe/services/recipe-update.service';
import {first, switchMap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class IngredientResolver implements Resolve<Ingredient[]> {

  constructor(private recipeUpdateService: RecipeUpdateService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Ingredient[]> {

    return this.recipeUpdateService.activeIngredientList$.pipe(
      first(),
      switchMap(ingredientList => {
        if (typeof ingredientList === 'undefined') {
          return this.recipeUpdateService.setActiveIngredientList();
        } else {
          return this.recipeUpdateService.activeIngredientList$.pipe(first());
        }
      })
    );
  }
}
