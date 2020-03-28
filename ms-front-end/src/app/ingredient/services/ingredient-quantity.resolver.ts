import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {IngredientQuantity} from '../../app.models';
import {combineLatest, Observable} from 'rxjs';
import {RecipeUpdateService} from '../../recipe/services/recipe-update.service';
import {first, switchMap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class IngredientQuantityResolver implements Resolve<IngredientQuantity[]> {

  constructor(private recipeUpdateService: RecipeUpdateService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IngredientQuantity[]> {

    return combineLatest(this.recipeUpdateService.activeRecipe$, this.recipeUpdateService.activeIngredientQuantityList$).pipe(
      first(),
      switchMap(value => {
        if (typeof value[1] !== 'undefined') {
          return this.recipeUpdateService.activeIngredientQuantityList$.pipe(first());
        } else {
          return this.recipeUpdateService.setActiveIngredientQuantityList(value[0].id);
        }
      })
    );
  }
}
