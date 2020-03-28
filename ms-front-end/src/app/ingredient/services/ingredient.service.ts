import {ModelService} from '../../core/services/model.service';
import {Ingredient} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {IngredientSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

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

  private static capitalizeFirstLetter(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  create(item: Ingredient): Observable<Ingredient> {
    item.name = IngredientService.capitalizeFirstLetter(item.name);
    return super.create(item);
  }

  update(item: Ingredient): Observable<Ingredient> {
    item.name = IngredientService.capitalizeFirstLetter(item.name);
    return super.update(item);
  }

}
