import {ModelService} from '../../core/services/model.service';
import {Ingredient} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {IngredientSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IngredientService extends ModelService<Ingredient> {

  constructor(authService: AuthService) {
    super(
      authService,
      Ingredient,
      new IngredientSerializer()
    );
  }

}
