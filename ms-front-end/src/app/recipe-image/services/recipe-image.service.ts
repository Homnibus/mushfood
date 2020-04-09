import {ModelService} from '../../core/services/model.service';
import {Recipe, RecipeImage} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {RecipeImageSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class RecipeImageService extends ModelService<RecipeImage> {

  private activeRecipeImageSubject = new BehaviorSubject<RecipeImage>(undefined);
  public activeRecipeImage$ = this.activeRecipeImageSubject.asObservable();
  private activeRecipeImage: RecipeImage;
  private activeRecipe: Recipe;

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

  setActiveRecipeImage(recipe: Recipe): Observable<RecipeImage> {
    // Check if the active Recipe has change to know if the retrieve the image need to be retrieved
    if (this.activeRecipe !== recipe) {
      this.activeRecipe = recipe;
      return this.getRecipeImage(recipe.id).pipe(
        map(recipeImage => {
          this.activeRecipeImage = recipeImage;
          this.activeRecipeImageSubject.next(recipeImage);
          return recipeImage;
        })
      );
      // Else return the current image
    } else {
      return of(this.activeRecipeImage);
    }
  }

  updateActiveRecipeImage(imageFile: File): RecipeImage {
    this.activeRecipeImage.imageFile = imageFile;
    this.activeRecipeImageSubject.next(this.activeRecipeImage);
    return this.activeRecipeImage;
  }

  createActiveRecipeImage(imageFile: File): RecipeImage {
    const createdRecipeImage = new RecipeImage();
    createdRecipeImage.imageFile = imageFile;
    createdRecipeImage.recipe = this.activeRecipe.id;
    this.activeRecipeImage = createdRecipeImage;
    this.activeRecipeImageSubject.next(createdRecipeImage);
    return createdRecipeImage;
  }

  removeActiveRecipeImage(): void {
    this.activeRecipeImageSubject.next(undefined);
  }

  saveRecipeImage(): Observable<RecipeImage> {
    if (this.activeRecipeImage?.imageFile) {
      let saveRecipeImageObservable: Observable<RecipeImage>;
      if (this.activeRecipeImage.id) {
        saveRecipeImageObservable = this.update(this.activeRecipeImage);
      } else {
        saveRecipeImageObservable = this.create(this.activeRecipeImage);
      }
      return saveRecipeImageObservable.pipe(map(recipeImage => {
          this.activeRecipeImage = recipeImage;
          this.activeRecipeImageSubject.next(recipeImage);
          return recipeImage;
        })
      );
    } else {
      return of(undefined);
    }
  }

}
