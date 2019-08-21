import {ModelService} from '../../core/services/model.service';
import {RecipeImage} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {RecipeImageSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecipeImageService extends ModelService<RecipeImage> {

  constructor(authService: AuthService) {
    super(
      authService,
      RecipeImage,
      new RecipeImageSerializer()
    );
  }
}
