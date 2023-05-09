import { ModelService } from "../../core/services/model.service";
import { Recipe, RecipeImage } from "../../app.models";
import { RecipeImageSerializer } from "../../app.serializers";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { FormControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class RecipeImageService extends ModelService<RecipeImage> {
  private activeRecipe: Recipe;
  private activeRecipeImage: RecipeImage;
  private activeRecipeImageSubject = new BehaviorSubject<RecipeImage>(
    undefined
  );
  public activeRecipeImage$ = this.activeRecipeImageSubject.asObservable();

  constructor(http: HttpClient) {
    super(http, RecipeImage, new RecipeImageSerializer());
  }

  /**
   * Retrieve from the backend the image linked to a given recipe and set it as the active one
   * @param recipe The recipe from witch the image will be loaded
   * @param keepActiveList If true, keep the current image for the same recipe
   * @returns The image linked to the given recipe
   */
  initActiveRecipeImage(
    recipe: Recipe,
    keepActive: boolean = false
  ): Observable<RecipeImage> {
    if (this.activeRecipe === recipe && keepActive) {
      return of(this.activeRecipeImage);
    } else {
      this.activeRecipe = recipe;
      return this.filteredList(`recipe__id=${recipe.id}`)
        .pipe(
          map((recipeImageList) =>
            recipeImageList.length ? recipeImageList[0] : undefined
          )
        )
        .pipe(
          tap((recipeImage) => {
            this.activeRecipeImage = recipeImage;
            this.activeRecipeImageSubject.next(recipeImage);
          })
        );
    }
  }

  addRecipeImageToUpdate(imageFile: File): RecipeImage {
    this.activeRecipeImage.imageFile = imageFile;
    this.activeRecipeImageSubject.next(this.activeRecipeImage);
    return this.activeRecipeImage;
  }

  addRecipeImageToCreate(imageFile: File): RecipeImage {
    const createdRecipeImage = new RecipeImage();
    createdRecipeImage.imageFile = imageFile;
    createdRecipeImage.recipe = this.activeRecipe.id;
    this.activeRecipeImage = createdRecipeImage;
    this.activeRecipeImageSubject.next(createdRecipeImage);
    return createdRecipeImage;
  }

  saveRecipeImage(): Observable<RecipeImage> {
    if (this.activeRecipeImage?.imageFile) {
      let saveRecipeImageObservable: Observable<RecipeImage>;
      if (this.activeRecipeImage.id) {
        saveRecipeImageObservable = this.update(this.activeRecipeImage);
      } else {
        saveRecipeImageObservable = this.create(this.activeRecipeImage);
      }
      return saveRecipeImageObservable.pipe(
        tap((recipeImage) => {
          this.activeRecipeImage = recipeImage;
          this.activeRecipeImageSubject.next(recipeImage);
        })
      );
    } else {
      return of(undefined);
    }
  }

  resetModification() {
    if (this.activeRecipeImage?.imageFile) {
      this.activeRecipeImage.imageFile = undefined;
    }
  }

  /**
   * Validate that the input is of type image
   * @param control The form control to apply the validation
   * @returns a json with the error, or null if the form is valid
   */
  imageTypeValidator(control: FormControl) {
    const mimeType = control.value?.type;
    return mimeType && mimeType.match(/image\/*/) == null
      ? { forbiddenFileType: { value: mimeType } }
      : null;
  }
}
