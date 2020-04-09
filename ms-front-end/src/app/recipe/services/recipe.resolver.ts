import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Recipe} from '../../app.models';
import {Observable} from 'rxjs';
import {RecipeService} from './recipe.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeResolver implements Resolve<Recipe> {

  constructor(private recipeService: RecipeService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe> {
    return this.recipeService.setActiveRecipe(route.paramMap.get('slug'));
  }

}
