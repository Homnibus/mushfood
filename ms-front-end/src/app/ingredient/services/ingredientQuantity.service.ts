import {ModelService} from '../../core/services/model.service';
import {IngredientQuantity} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {IngredientQuantitySerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IngredientQuantityService extends ModelService<IngredientQuantity> {

  constructor(authService: AuthService) {
    super(
      authService,
      IngredientQuantity,
      new IngredientQuantitySerializer()
    );
  }

}
