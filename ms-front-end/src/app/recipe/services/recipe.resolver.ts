import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Recipe} from '../../app.models';
import {Observable} from 'rxjs';
import {RecipeService} from './recipe.service';
import {map} from 'rxjs/operators';
import {AuthService} from '../../core/services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeResolver implements Resolve<Recipe> {

  constructor(private recipeService: RecipeService,
              public authService: AuthService,
              private router: Router,) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe> {
    return this.recipeService.setActiveRecipe(route.paramMap.get('slug')).pipe(
      map( recipe => {
        if(this.authService.currentUser.userName && recipe.authorUserName !== this.authService.currentUser.userName){
          this.router.navigateByUrl('/error/forbidden');
        }
        return recipe;
        }
      ));
  }

}
