import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {RecipeImage} from '../../app.models';
import {combineLatest, Observable} from 'rxjs';
import {RecipeUpdateService} from '../../recipe/services/recipe-update.service';
import {first, switchMap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class RecipeImageResolver implements Resolve<RecipeImage> {

  constructor(private recipeUpdateService: RecipeUpdateService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RecipeImage> {

    return combineLatest(this.recipeUpdateService.activeRecipe$, this.recipeUpdateService.activeRecipeImage$).pipe(
      first(),
      switchMap(value => {
        if (value[0].id === value[1]?.recipe) {
          return this.recipeUpdateService.activeRecipeImage$.pipe(first());
        } else {
          return this.recipeUpdateService.setActiveRecipeImage(value[0].id);
        }
      })
    );
  }
}
