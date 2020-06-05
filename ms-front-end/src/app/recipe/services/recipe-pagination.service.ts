import {Recipe} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {RecipeSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

import {ModelPaginationService} from '../../core/services/model-pagination.service';

@Injectable({
  providedIn: 'root',
})
export class RecipePaginationService extends ModelPaginationService<Recipe> {

  constructor(authService: AuthService) {
    super(
      authService,
      Recipe,
      new RecipeSerializer()
    );
  }
}
