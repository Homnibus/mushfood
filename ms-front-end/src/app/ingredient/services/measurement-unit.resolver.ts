import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {MeasurementUnit} from '../../app.models';
import {Observable} from 'rxjs';
import {MeasurementUnitService} from './measurement-unit.service';


@Injectable({
  providedIn: 'root'
})
export class MeasurementUnitResolver implements Resolve<MeasurementUnit[]> {

  constructor(private measurementUnitService: MeasurementUnitService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MeasurementUnit[]> {
    return this.measurementUnitService.loadMeasurementUnitList();
  }
}
