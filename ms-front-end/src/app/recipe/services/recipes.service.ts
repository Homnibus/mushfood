import {ModelService} from '../../core/services/model.service';
import {Recipe} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {RecipeSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecipeService extends ModelService<Recipe> {

  constructor(authService: AuthService) {
    super(
      authService,
      Recipe,
      new RecipeSerializer()
    );
  }

}
