import {ModelService} from '../../core/services/model.service';
import {MeasurementUnit} from '../../app.models';
import {MeasurementUnitSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MeasurementUnitService extends ModelService<MeasurementUnit> {

  public measurementUnitList: MeasurementUnit[];

  constructor(http: HttpClient) {
    super(
      http,
      MeasurementUnit,
      new MeasurementUnitSerializer()
    );
  }

    /**
   * Retrieve from the backend the measurement unit list
   * @returns An observable to subscribe to to get the measurement unit list
   */
  initMeasurementUnitList(): Observable<MeasurementUnit[]> {
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

  getMeasurementUnitById(measurementUnitId: number | MeasurementUnit): MeasurementUnit {
    if (typeof measurementUnitId !== "number") {
      return undefined;
    }
    return this.measurementUnitList.find(
      (measurementUnit) => measurementUnit.id === measurementUnitId
    );
  }

}
