import {Recipe} from '../../app.models';
import {RecipeSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';

import {ModelPaginationService} from '../../core/services/model-pagination.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RecipePaginationService extends ModelPaginationService<Recipe> {

  constructor(http: HttpClient) {
    super(
      http,
      Recipe,
      new RecipeSerializer()
    );
  }
}
