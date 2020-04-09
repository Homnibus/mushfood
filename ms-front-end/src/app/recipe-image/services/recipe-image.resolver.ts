import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {RecipeImage} from '../../app.models';
import {Observable} from 'rxjs';
import {first, switchMap} from 'rxjs/operators';
import {RecipeService} from '../../recipe/services/recipe.service';
import {RecipeImageService} from './recipe-image.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeImageResolver implements Resolve<RecipeImage> {

  constructor(private recipeImageService: RecipeImageService,
              private recipeService: RecipeService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RecipeImage> {
    return this.recipeService.activeRecipe$.pipe(
      first(),
      switchMap(recipe => this.recipeImageService.setActiveRecipeImage(recipe))
    );
  }
}
