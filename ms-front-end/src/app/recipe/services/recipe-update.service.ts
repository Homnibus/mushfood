import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {Ingredient, IngredientQuantity, MeasurementUnit, Recipe, RecipeImage} from '../../app.models';
import {RecipeService} from './recipe.service';
import {first, map, switchMap, tap} from 'rxjs/operators';
import {RecipeImageService} from '../../recipe-image/services/recipe-image.service';
import {IngredientQuantityService} from '../../ingredient/services/ingredient-quantity.service';
import {MeasurementUnitService} from '../../ingredient/services/measurement-unit.service';
import {IngredientService} from '../../ingredient/services/ingredient.service';

@Injectable({
  providedIn: 'root'
})
export class RecipeUpdateService {

  public measurementUnitList: MeasurementUnit[];
  private activeRecipeSubject = new BehaviorSubject<Recipe>(undefined);
  public activeRecipe$ = this.activeRecipeSubject.asObservable();
  private activeRecipeImageSubject = new BehaviorSubject<RecipeImage>(undefined);
  public activeRecipeImage$ = this.activeRecipeImageSubject.asObservable();
  private activeIngredientQuantityListSubject = new BehaviorSubject<IngredientQuantity[]>(undefined);
  public activeIngredientQuantityList$ = this.activeIngredientQuantityListSubject.asObservable();
  private activeIngredientListSubject = new BehaviorSubject<Ingredient[]>(undefined);
  public activeIngredientList$ = this.activeIngredientListSubject.asObservable();
  private toUpdateRecipe = false;
  private toCreateIngredientQuantity: IngredientQuantity[] = [];
  private toUpdateIngredientQuantity: IngredientQuantity[] = [];
  private toDeleteIngredientQuantity: IngredientQuantity[] = [];

  constructor(private recipeService: RecipeService,
              private recipeImageService: RecipeImageService,
              private ingredientQuantityService: IngredientQuantityService,
              private measurementUnitService: MeasurementUnitService,
              private ingredientService: IngredientService,) {
  }

  setActiveRecipe(slug: string): Observable<Recipe> {
    return this.recipeService.get(slug).pipe(
      map(
        recipeList => {
          let recipe: Recipe;
          if (recipeList.length > 0) {
            recipe = recipeList[0];
          }
          this.activeRecipeSubject.next(recipe);
          return recipe;
        }
      )
    );
  }

  setActiveRecipeImage(recipeId: number): Observable<RecipeImage> {
    return this.recipeImageService.getRecipeImage(recipeId).pipe(
      map(recipeImage => {
        this.activeRecipeImageSubject.next(recipeImage);
        return recipeImage;
      })
    );
  }

  setActiveIngredientQuantityList(recipeId: number): Observable<IngredientQuantity[]> {
    return this.ingredientQuantityService.filteredList(`recipe__id=${recipeId}`).pipe(
      map(ingredientQuantityList => {
        this.activeIngredientQuantityListSubject.next(ingredientQuantityList);
        return ingredientQuantityList;
      })
    );
  }

  setActiveIngredientList(): Observable<Ingredient[]> {
    return this.ingredientService.list().pipe(
      map(ingredientList => {
        this.activeIngredientListSubject.next(ingredientList);
        return ingredientList;
      })
    );
  }

  loadMeasurementUnitList(): Observable<MeasurementUnit[]> {
    if (this.measurementUnitList) {
      return of(this.measurementUnitList);
    } else {
      return this.measurementUnitService.list().pipe(
        map(measurementUnitList => {
          this.measurementUnitList = measurementUnitList;
          return measurementUnitList;
        })
      );
    }
  }

  updateActiveRecipeInstruction(instructions: string): void {
    let updatedRecipe: Recipe;
    this.toUpdateRecipe = true;
    this.activeRecipe$.pipe(first()).subscribe(data => {
      updatedRecipe = data;
      updatedRecipe.instructions = instructions;
      this.activeRecipeSubject.next(updatedRecipe);
    });
  }

  updateActiveRecipeGeneralSettings(title: string, inspiration: string): void {
    let updatedRecipe: Recipe;
    this.toUpdateRecipe = true;
    this.activeRecipe$.pipe(first()).subscribe(data => {
      updatedRecipe = data;
      updatedRecipe.title = title;
      updatedRecipe.inspiration = inspiration;
      this.activeRecipeSubject.next(updatedRecipe);
    });
  }

  updateActiveRecipeImage(imageFile: File): void {
    let updatedRecipeImage: RecipeImage;
    this.activeRecipeImage$.pipe(first()).subscribe(recipeImage => {
      updatedRecipeImage = recipeImage;
      updatedRecipeImage.imageFile = imageFile;
      this.activeRecipeImageSubject.next(updatedRecipeImage);
    });
  }

  createActiveRecipeImage(imageFile: File) {
    const createdRecipeImage = new RecipeImage();
    createdRecipeImage.imageFile = imageFile;
    this.activeRecipe$.pipe(first()).subscribe(recipe => {
      createdRecipeImage.recipe = recipe.id;
      this.activeRecipeImageSubject.next(createdRecipeImage);
    });
  }

  removeActiveRecipe(): void {
    this.activeRecipeSubject.next(undefined);
  }

  removeActiveRecipeImage(): void {
    this.activeRecipeImageSubject.next(undefined);
  }

  removeActiveIngredientQuantityList() {
    this.activeIngredientQuantityListSubject.next(undefined);
  }

  saveRecipe(): Observable<Recipe> {
    if (this.toUpdateRecipe) {
      return this.activeRecipe$.pipe(
        first(),
        switchMap(recipe => this.recipeService.update(recipe))
      );
    } else {
      return this.activeRecipe$.pipe(
        first(),
      );
    }
  }

  saveRecipeImage(): Observable<RecipeImage> {
    return this.activeRecipeImage$.pipe(
      first(),
      switchMap(recipeImage => {
        if (recipeImage?.imageFile) {
          if (recipeImage.id) {
            return this.recipeImageService.update(recipeImage);
          } else {
            return this.recipeImageService.create(recipeImage);
          }
        } else {
          return of(undefined);
        }
      })
    );
  }

  saveIngredient(): Observable<Ingredient[]> {
    // List all the new ingredient to create
    let toCreateIngredientNameList = this.toCreateIngredientQuantity
      .concat(this.toUpdateIngredientQuantity)
      .filter(ingredientQuantity => !ingredientQuantity.ingredient?.id)
      .map(ingredientQuantity => ingredientQuantity.ingredient.name.trim().toLowerCase());
    // Remove the duplicates
    toCreateIngredientNameList = Array.from(new Set(toCreateIngredientNameList));
    // Map back ingredient names to ingredient objects
    const toCreateIngredientList = toCreateIngredientNameList
      .map(ingredientName => {
        const ingredient = new Ingredient();
        ingredient.name = ingredientName;
        return ingredient;
      });

    // Create a list of the result of the creation of the new ingredients
    let listOfIngredientObservable: Observable<Ingredient>[];
    if (toCreateIngredientList.length > 0) {
      listOfIngredientObservable = toCreateIngredientList.map(
        ingredient => this.ingredientService.create(ingredient)
      );
    } else {
      listOfIngredientObservable = [of(undefined)];
    }
    return forkJoin(listOfIngredientObservable).pipe(
      map(ingredientList => ingredientList.filter(ingredient => !!ingredient)),
      tap(ingredientList => {
        this.activeIngredientList$.pipe(first()).subscribe(activeIngredientList => {
          this.activeIngredientListSubject.next(activeIngredientList.concat(ingredientList));
        });
      })
    );
  }

  saveIngredientQuantity(savedIngredient: Observable<Ingredient[]>): Observable<IngredientQuantity[]> {
    return savedIngredient.pipe(
      switchMap(newIngredientList => {
        let listOfIngredientQuantityToDeleteObservable: Observable<IngredientQuantity>[];
        if (this.toDeleteIngredientQuantity.length > 0) {
          listOfIngredientQuantityToDeleteObservable = this.toDeleteIngredientQuantity.map(ingredientQuantity => {
            return this.ingredientQuantityService.delete(ingredientQuantity);
          });
        } else {
          listOfIngredientQuantityToDeleteObservable = [of(undefined)];
        }

        let listOfIngredientQuantityToCreateObservable: Observable<IngredientQuantity>[];
        if (this.toCreateIngredientQuantity.length > 0) {
          // For each ingredientQuantity, check if the ingredient needed to be create and, if it's the case, replace it with
          // the one created by saveIngredientObservable.
          listOfIngredientQuantityToCreateObservable = this.toCreateIngredientQuantity.map(ingredientQuantity => {
            if (!ingredientQuantity.ingredient.id) {
              ingredientQuantity.ingredient = newIngredientList.find(ingredient =>
                ingredient.name.trim().toLowerCase() === ingredientQuantity.ingredient.name.trim().toLowerCase());
            }
            return this.ingredientQuantityService.create(ingredientQuantity);
          });
        } else {
          listOfIngredientQuantityToCreateObservable = [of(undefined)];
        }

        let listOfIngredientQuantityToUpdateObservable: Observable<IngredientQuantity>[];
        if (this.toUpdateIngredientQuantity.length > 0) {
          // For each ingredientQuantity, check if the ingredient needed to be create and, if it's the case, replace it with
          // the one created by saveIngredientObservable.
          listOfIngredientQuantityToUpdateObservable = this.toUpdateIngredientQuantity.map(ingredientQuantity => {
            if (!ingredientQuantity.ingredient.id) {
              ingredientQuantity.ingredient = newIngredientList.find(ingredient =>
                ingredient.name.trim().toLowerCase() === ingredientQuantity.ingredient.name.trim().toLowerCase());
            }
            return this.ingredientQuantityService.update(ingredientQuantity);
          });
        } else {
          listOfIngredientQuantityToUpdateObservable = [of(undefined)];
        }
        return forkJoin(listOfIngredientQuantityToCreateObservable
          .concat(listOfIngredientQuantityToUpdateObservable)
          .concat(listOfIngredientQuantityToDeleteObservable)
        );
      }),
      tap(() => {
        this.toCreateIngredientQuantity = [];
        this.toUpdateIngredientQuantity = [];
        this.toDeleteIngredientQuantity = [];
      })
    );
  }

  saveAllTheThings(): Observable<Recipe> {
    return forkJoin([
      this.saveRecipe(),
      this.saveRecipeImage(),
      this.saveIngredientQuantity(this.saveIngredient()),
    ]).pipe(
      map(data => data[0])
    );
  }

  deleteRecipe(): Observable<Recipe> {
    let deletedRecipe: Recipe;
    return this.activeRecipe$.pipe(
      first(),
      switchMap(recipe => {
        deletedRecipe = recipe;
        deletedRecipe.logicalDelete = true;
        return this.recipeService.update(deletedRecipe);
      }),
      tap(updatedRecipe => this.activeRecipeSubject.next(updatedRecipe)),
    );
  }

  addIngredientQuantityToCreate(ingredientQuantity: IngredientQuantity): void {
    this.toCreateIngredientQuantity.push(ingredientQuantity);
    this.activeIngredientQuantityList$.pipe(first()).subscribe(ingredientQuantityList => {
      ingredientQuantityList.push(ingredientQuantity);
      this.activeIngredientQuantityListSubject.next(ingredientQuantityList);
    });
  }

  addIngredientQuantityToUpdate(ingredientQuantity: IngredientQuantity): void {
    const indexOfIngredientQuantityInCreateList = this.toCreateIngredientQuantity
      .map(x => x.tempId)
      .indexOf(ingredientQuantity.tempId);
    if (indexOfIngredientQuantityInCreateList >= 0) {
      this.toCreateIngredientQuantity.splice(indexOfIngredientQuantityInCreateList, 1, ingredientQuantity);
      this.activeIngredientQuantityList$.pipe(first()).subscribe(ingredientQuantityList => {
        const elementPos = ingredientQuantityList.map(x => x.tempId).indexOf(ingredientQuantity.tempId);
        ingredientQuantityList.splice(elementPos, 1, ingredientQuantity);
        this.activeIngredientQuantityListSubject.next(ingredientQuantityList);
      });
    } else {
      this.toUpdateIngredientQuantity.push(ingredientQuantity);
      this.activeIngredientQuantityList$.pipe(first()).subscribe(ingredientQuantityList => {
        const elementPos = ingredientQuantityList.map(x => x.id).indexOf(ingredientQuantity.id);
        ingredientQuantityList.splice(elementPos, 1, ingredientQuantity);
        this.activeIngredientQuantityListSubject.next(ingredientQuantityList);
      });
    }
  }

  addIngredientQuantityToDelete(ingredientQuantity: IngredientQuantity): void {
    const indexOfIngredientQuantityInCreateList = this.toCreateIngredientQuantity.indexOf(ingredientQuantity);
    if (indexOfIngredientQuantityInCreateList >= 0) {
      this.toCreateIngredientQuantity.splice(indexOfIngredientQuantityInCreateList, 1);
    } else {
      this.toDeleteIngredientQuantity.push(ingredientQuantity);
    }
    this.activeIngredientQuantityList$.pipe(first()).subscribe(ingredientQuantityList => {
      this.activeIngredientQuantityListSubject.next(ingredientQuantityList.filter(
        toFilterIngredientQuantity => toFilterIngredientQuantity !== ingredientQuantity
      ));
    });
  }

}
