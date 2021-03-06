import {ModelService} from '../../core/services/model.service';
import {User} from '../../app.models';
import {UserSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ModelService<User> {

  constructor(http: HttpClient, ) {
    super(
      http,
      User,
      new UserSerializer()
    );
  }

}
