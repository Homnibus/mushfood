import {ModelService} from '../../core/services/model.service';
import {MeasurementUnit} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {MeasurementUnitSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MeasurementUnitService extends ModelService<MeasurementUnit> {

  constructor(authService: AuthService) {
    super(
      authService,
      MeasurementUnit,
      new MeasurementUnitSerializer()
    );
  }

}
