import {ModelService} from '../../core/services/model.service';
import {MeasurementUnit} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {MeasurementUnitSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MeasurementUnitService extends ModelService<MeasurementUnit> {

  public measurementUnitList: MeasurementUnit[];

  constructor(authService: AuthService) {
    super(
      authService,
      MeasurementUnit,
      new MeasurementUnitSerializer()
    );
  }

  loadMeasurementUnitList(): Observable<MeasurementUnit[]> {
    if (this.measurementUnitList) {
      return of(this.measurementUnitList);
    } else {
      return this.list().pipe(
        map(measurementUnitList => {
          this.measurementUnitList = measurementUnitList;
          return measurementUnitList;
        })
      );
    }
  }

}
