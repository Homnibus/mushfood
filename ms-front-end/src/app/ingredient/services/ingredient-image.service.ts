import {ModelService} from '../../core/services/model.service';
import {IngredientImage} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {IngredientImageSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IngredientImageService extends ModelService<IngredientImage> {

  constructor(authService: AuthService) {
    super(
      authService,
      IngredientImage,
      new IngredientImageSerializer()
    );
  }
}
