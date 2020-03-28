import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {MeasurementUnit} from '../../app.models';
import {Observable} from 'rxjs';
import {RecipeUpdateService} from '../../recipe/services/recipe-update.service';


@Injectable({
  providedIn: 'root'
})
export class MeasurementUnitResolver implements Resolve<MeasurementUnit[]> {

  constructor(private recipeUpdateService: RecipeUpdateService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MeasurementUnit[]> {
    return this.recipeUpdateService.loadMeasurementUnitList();
  }
}
