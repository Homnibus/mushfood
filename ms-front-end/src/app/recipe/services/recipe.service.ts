import { ModelService } from "../../core/services/model.service";
import { Category, ModelState, Recipe, RecipeImage } from "../../app.models";
import { RecipeSerializer } from "../../app.serializers";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class RecipeService extends ModelService<Recipe> {
  private activeRecipe: Recipe;
  private activeRecipeSubject = new BehaviorSubject<Recipe>(undefined);
  public activeRecipe$ = this.activeRecipeSubject.asObservable();
  private updatedRecipe: Recipe;
  private updatedRecipeSubject = new BehaviorSubject<Recipe>(undefined);
  public updatedRecipe$ = this.updatedRecipeSubject.asObservable();
  private toUpdateRecipe = false;

  constructor(http: HttpClient) {
    super(http, Recipe, new RecipeSerializer());
  }

  /**
   * Retrieve from the backend the recipe linked to a given slug and set it as the active one
   * @param slug The slug from witch the recipe will be loaded
   * @returns An observable to subscribe to to get The recipe linked to the given slug
   */
  initActiveRecipe(slug: string): Observable<Recipe> {
    return this.get(slug).pipe(
      map((recipeList) => {
        let recipe: Recipe;
        if (recipeList.length > 0) {
          recipe = recipeList[0];
        }
        // TODO : il ce passe quoi si length = 0 ?
        this.activeRecipe = recipe;
        this.resetModification();
        this.activeRecipeSubject.next(recipe);
        return recipe;
      })
    );
  }

  /**
   * Set the recipe instructions to be updated
   * The update is handle with the backend when the save function is used
   * @param instructionsToUpdate the instructions to update
   * @returns The recipe to update, updated with the given instructions
   */
  addRecipeInstructionsToUpdate(instructionsToUpdate: string): Recipe {
    this.toUpdateRecipe = true;
    this.updatedRecipe.instructions = instructionsToUpdate;
    this.updatedRecipeSubject.next(this.updatedRecipe);
    return this.updatedRecipe;
  }

  /**
   * Set the recipe categories to be updated
   * The update is handle with the backend when the save function is used
   * @param categoriesToUpdate the categories to update
   * @returns The recipe to update, updated with the given categories
   */
  addRecipeCategoriesToUpdate(categoriesToUpdate: Category[]): Recipe {
    this.toUpdateRecipe = true;
    this.updatedRecipe.categories = categoriesToUpdate;
    this.updatedRecipeSubject.next(this.updatedRecipe);
    return this.updatedRecipe;
  }

  /**
   * Set the recipe general settings to be updated
   * The update is handle with the backend when the save function is used
   * @param titleToUpdate the title to update
   * @param inspirationToUpdate the inspiration to update
   * @param portionsToUpdate the portions to update
   * @returns The recipe to update, updated with the given general settings
   */
  addRecipeGeneralSettingsToUpdate(
    titleToUpdate: string,
    inspirationToUpdate: string,
    portionsToUpdate: number
  ): Recipe {
    this.toUpdateRecipe = true;
    this.updatedRecipe.title = titleToUpdate;
    this.updatedRecipe.inspiration = inspirationToUpdate;
    this.updatedRecipe.portions = portionsToUpdate;
    this.updatedRecipeSubject.next(this.updatedRecipe);
    return this.updatedRecipe;
  }

  /**
   * Set the recipe image to be updated
   * The update is handle with the backend when the save function is used
   * @param recipeImage the image to update
   * @returns The recipe to update, updated with the given image
   */
  addRecipeImageToUpdate(recipeImage: RecipeImage): void {
    if (!recipeImage) {
      return;
    }
    this.updatedRecipe.recipeImage = recipeImage;
    this.updatedRecipeSubject.next(this.updatedRecipe);
  }

  /**
   * Generate an Observable that handle the update of the recipe by calling the backend
   * @returns An Observable to subscribe to in order to call the backend and perform the update
   */
  saveRecipe(): Observable<Recipe> {
    if (this.toUpdateRecipe) {
      return this.update(this.updatedRecipe).pipe(
        tap((recipe) => {
          this.activeRecipe = recipe;
          this.resetModification();
          this.activeRecipeSubject.next(recipe);
        })
      );
    } else {
      return of(this.activeRecipe);
    }
  }

  /**
   * Generate an Observable that handle the deletion of the recipe by calling the backend
   * @returns An Observable to subscribe to in order to call the backend and perform the deletion
   */
  deleteRecipe(): Observable<Recipe> {
    this.activeRecipe.logicalDelete = true;
    this.activeRecipeSubject.next(this.activeRecipe);
    return this.update(this.activeRecipe);
  }

  createVariant(
    variantTitle: string,
    toCopyRecipe: Recipe
  ): Observable<Recipe> {
    const recipe = new Recipe();
    recipe.variantOf = toCopyRecipe.id;
    recipe.state = ModelState.NotSaved;
    recipe.title = variantTitle;
    recipe.categories = toCopyRecipe.categories;
    recipe.inspiration = toCopyRecipe.inspiration;
    recipe.instructions = toCopyRecipe.instructions;
    recipe.portions = toCopyRecipe.portions;
    return this.create(recipe);
  }

  resetModification() {
    this.toUpdateRecipe = false;
    this.updatedRecipe = Object.assign(new Recipe(), this.activeRecipe);
  }
}
