import {ModelService} from '../../core/services/model.service';
import {UserPassword} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {UserPasswordSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PasswordService extends ModelService<UserPassword> {

  constructor(authService: AuthService) {
    super(
      authService,
      UserPassword,
      new UserPasswordSerializer()
    );
  }

}
