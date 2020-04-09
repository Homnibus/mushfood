import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Ingredient} from '../../app.models';
import {Observable} from 'rxjs';
import {IngredientService} from './ingredient.service';


@Injectable({
  providedIn: 'root'
})
export class IngredientResolver implements Resolve<Ingredient[]> {

  constructor(private ingredientService: IngredientService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Ingredient[]> {
    return this.ingredientService.setActiveIngredientList();
  }
}
