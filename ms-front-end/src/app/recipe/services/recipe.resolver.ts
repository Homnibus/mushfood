import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Recipe} from '../../app.models';
import {Observable} from 'rxjs';
import {RecipeUpdateService} from './recipe-update.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeResolver implements Resolve<Recipe> {

  constructor(private recipeDetailsService: RecipeUpdateService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe> {
    return this.recipeDetailsService.setActiveRecipe(route.paramMap.get('slug'));
  }
}
