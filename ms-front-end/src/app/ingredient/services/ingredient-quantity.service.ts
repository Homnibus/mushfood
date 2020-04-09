import {ModelService} from '../../core/services/model.service';
import {Ingredient, IngredientQuantity, Recipe} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {IngredientQuantitySerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IngredientQuantityService extends ModelService<IngredientQuantity> {

  public toCreateIngredientQuantity: IngredientQuantity[] = [];
  public toUpdateIngredientQuantity: IngredientQuantity[] = [];
  public toDeleteIngredientQuantity: IngredientQuantity[] = [];
  private activeIngredientQuantityListSubject = new BehaviorSubject<IngredientQuantity[]>(undefined);
  public activeIngredientQuantityList$ = this.activeIngredientQuantityListSubject.asObservable();
  private activeIngredientQuantityList: IngredientQuantity[];
  private activeRecipe: Recipe;


  constructor(authService: AuthService) {
    super(
      authService,
      IngredientQuantity,
      new IngredientQuantitySerializer()
    );
  }

  filterIngredientList(ingredient: Ingredient | string, ingredientList: Ingredient[]): Ingredient[] {
    let filterValue = '';
    if (ingredient) {
      if (ingredient instanceof Ingredient) {
        filterValue = ingredient.name.trim().toLowerCase();
      } else {
        filterValue = ingredient.trim().toLowerCase();
      }
    }
    return ingredientList.filter(toFilterIngredient => toFilterIngredient?.name.toLowerCase().includes(filterValue));
  }

  displayIngredient(ingredient?: Ingredient): string | undefined {
    return ingredient ? ingredient.name : undefined;
  }

  setActiveIngredientQuantityList(recipe: Recipe): Observable<IngredientQuantity[]> {
    // If the active recipe is a new one, load the linked ingredient quantities
    if (this.activeRecipe !== recipe) {
      this.activeRecipe = recipe;
      return this.filteredList(`recipe__id=${recipe.id}`).pipe(
        map(ingredientQuantityList => {
          this.activeIngredientQuantityList = ingredientQuantityList;
          this.activeIngredientQuantityListSubject.next(ingredientQuantityList);
          return ingredientQuantityList;
        }));
      // Else return the current ingredient quantities list
    } else {
      return of(this.activeIngredientQuantityList);
    }
  }

  addIngredientQuantityToCreate(ingredientQuantity: IngredientQuantity): IngredientQuantity {
    this.toCreateIngredientQuantity.push(ingredientQuantity);
    this.activeIngredientQuantityList.push(ingredientQuantity);
    this.activeIngredientQuantityListSubject.next(this.activeIngredientQuantityList);
    return ingredientQuantity;
  }

  addIngredientQuantityToUpdate(ingredientQuantity: IngredientQuantity): IngredientQuantity {
    const indexOfIngredientQuantityInCreateList = this.toCreateIngredientQuantity
      .map(x => x.tempId)
      .indexOf(ingredientQuantity.tempId);
    let elementPos: number;
    if (indexOfIngredientQuantityInCreateList >= 0) {
      this.toCreateIngredientQuantity.splice(indexOfIngredientQuantityInCreateList, 1, ingredientQuantity);
      elementPos = this.activeIngredientQuantityList.map(x => x.tempId).indexOf(ingredientQuantity.tempId);
    } else {
      this.toUpdateIngredientQuantity.push(ingredientQuantity);
      elementPos = this.activeIngredientQuantityList.map(x => x.id).indexOf(ingredientQuantity.id);
    }
    this.activeIngredientQuantityList[elementPos] = ingredientQuantity;
    this.activeIngredientQuantityListSubject.next(this.activeIngredientQuantityList);
    return ingredientQuantity;
  }

  addIngredientQuantityToDelete(ingredientQuantity: IngredientQuantity): IngredientQuantity {
    const indexOfIngredientQuantityInCreateList = this.toCreateIngredientQuantity.indexOf(ingredientQuantity);
    if (indexOfIngredientQuantityInCreateList >= 0) {
      this.toCreateIngredientQuantity.splice(indexOfIngredientQuantityInCreateList, 1);
    } else {
      this.toDeleteIngredientQuantity.push(ingredientQuantity);
    }
    this.activeIngredientQuantityList = this.activeIngredientQuantityList.filter(
      toFilterIngredientQuantity => toFilterIngredientQuantity !== ingredientQuantity
    );
    this.activeIngredientQuantityListSubject.next(this.activeIngredientQuantityList);
    return ingredientQuantity;
  }

  saveIngredientQuantity(savedIngredient: Observable<Ingredient[]>): Observable<IngredientQuantity[]> {
    return savedIngredient.pipe(
      switchMap(newIngredientList => {
        let listOfIngredientQuantityToDeleteObservable: Observable<IngredientQuantity>[];
        if (this.toDeleteIngredientQuantity.length > 0) {
          listOfIngredientQuantityToDeleteObservable = this.toDeleteIngredientQuantity.map(ingredientQuantity => {
            return this.delete(ingredientQuantity);
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
            return this.create(ingredientQuantity).pipe(
              // Update the active ingredient quantity list with the api return
              map(createdIngredientQuantity => {
                  const elementPos = this.activeIngredientQuantityList.map(x => x.tempId).indexOf(ingredientQuantity.tempId);
                  ingredientQuantity.id = createdIngredientQuantity.id;
                  ingredientQuantity.creationDate = createdIngredientQuantity.creationDate;
                  ingredientQuantity.updateDate = createdIngredientQuantity.updateDate;
                  ingredientQuantity.state = createdIngredientQuantity.state;
                  this.activeIngredientQuantityList[elementPos] = ingredientQuantity;
                  this.activeIngredientQuantityListSubject.next(this.activeIngredientQuantityList);
                  return ingredientQuantity;
                }
              ),
            );
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
            // Call the API to create the new ingredient quantity
            return this.update(ingredientQuantity).pipe(
              // Update the active ingredient quantity list with the api return
              map(createdIngredientQuantity => {
                  const elementPos = this.activeIngredientQuantityList.map(x => x.id).indexOf(ingredientQuantity.id);
                  ingredientQuantity.updateDate = createdIngredientQuantity.updateDate;
                  ingredientQuantity.state = createdIngredientQuantity.state;
                  this.activeIngredientQuantityList[elementPos] = ingredientQuantity;
                  this.activeIngredientQuantityListSubject.next(this.activeIngredientQuantityList);
                  return ingredientQuantity;
                }
              )
            );
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
        // reset the list
        this.toCreateIngredientQuantity = [];
        this.toUpdateIngredientQuantity = [];
        this.toDeleteIngredientQuantity = [];
      })
    );
  }

  removeActiveIngredientQuantityList() {
    this.activeIngredientQuantityListSubject.next(undefined);
  }

}
