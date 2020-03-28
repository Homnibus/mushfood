import {ModelService} from '../../core/services/model.service';
import {RecipeImage} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {RecipeImageSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

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

  getRecipeImage(recipeId: number): Observable<RecipeImage> {
    return this.filteredList(`recipe__id=${recipeId}`).pipe(
      map(recipeImageList => recipeImageList.length ? recipeImageList[0] : undefined)
    );
  }

  emailDomainValidator(control: FormControl) {
    const mimeType = control.value?.type;
    return (mimeType && mimeType.match(/image\/*/) == null) ? {forbiddenFileType: {value: mimeType}} : null;
  }

}
