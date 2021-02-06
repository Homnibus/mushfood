import {ModelService} from '../../core/services/model.service';
import {Registration} from '../../app.models';
import {RegistrationSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService extends ModelService<Registration> {

  constructor(http: HttpClient, ) {
    super(
      http,
      Registration,
      new RegistrationSerializer()
    );
  }

}
