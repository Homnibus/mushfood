import {ModelService} from '../../core/services/model.service';
import {Category, Recipe} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {RecipeSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RecipeService extends ModelService<Recipe> {

  public toUpdateRecipe = false;
  private activeRecipeSubject = new BehaviorSubject<Recipe>(undefined);
  public activeRecipe$ = this.activeRecipeSubject.asObservable();
  private activeRecipe: Recipe;

  constructor(authService: AuthService) {
    super(
      authService,
      Recipe,
      new RecipeSerializer()
    );
  }

  setActiveRecipe(slug: string): Observable<Recipe> {
    // First get the current Recipe
    if (this.activeRecipe?.slug === slug) {
      return of(this.activeRecipe);
      // Else, call the API to retrieve the recipe
    } else {
      return this.get(slug).pipe(
        map(recipeList => {
          let recipe: Recipe;
          if (recipeList.length > 0) {
            recipe = recipeList[0];
          }
          // And set the current recipe as the one just retrieved
          this.activeRecipe = recipe;
          this.activeRecipeSubject.next(recipe);
          return recipe;
        }));
    }
  }

  updateActiveRecipeInstruction(instructions: string): Recipe {
    this.toUpdateRecipe = true;
    this.activeRecipe.instructions = instructions;
    this.activeRecipeSubject.next(this.activeRecipe);
    return this.activeRecipe;
  }

  updateActiveRecipeCategories(categories: Category[]): Recipe {
    this.toUpdateRecipe = true;
    this.activeRecipe.categories = categories;
    this.activeRecipeSubject.next(this.activeRecipe);
    return this.activeRecipe;
  }

  updateActiveRecipeGeneralSettings(title: string, inspiration: string, portions: number): Recipe {
    this.toUpdateRecipe = true;
    this.activeRecipe.title = title;
    this.activeRecipe.inspiration = inspiration;
    this.activeRecipe.portions = portions;
    this.activeRecipeSubject.next(this.activeRecipe);
    return this.activeRecipe;
  }

  saveRecipe(): Observable<Recipe> {
    if (this.toUpdateRecipe) {
      return this.update(this.activeRecipe);
    } else {
      return of(this.activeRecipe);
    }
  }

  deleteRecipe(): Observable<Recipe> {
    this.activeRecipe.logicalDelete = true;
    this.activeRecipeSubject.next(this.activeRecipe);
    return this.update(this.activeRecipe);
  }

  removeActiveRecipe(): void {
    this.activeRecipeSubject.next(undefined);
  }

}
