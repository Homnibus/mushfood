import {ModelService} from '../../core/services/model.service';
import {UserPassword} from '../../app.models';
import {UserPasswordSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PasswordService extends ModelService<UserPassword> {

  constructor(http: HttpClient) {
    super(
      http,
      UserPassword,
      new UserPasswordSerializer()
    );
  }

}
