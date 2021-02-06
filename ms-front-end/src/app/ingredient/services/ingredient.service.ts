import {ModelService} from '../../core/services/model.service';
import {Ingredient, IngredientQuantity} from '../../app.models';
import {IngredientSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class IngredientService extends ModelService<Ingredient> {

  private activeIngredientListSubject = new BehaviorSubject<Ingredient[]>(undefined);
  public activeIngredientList$ = this.activeIngredientListSubject.asObservable();
  private activeIngredientList: Ingredient[];

  constructor(http: HttpClient) {
    super(
      http,
      Ingredient,
      new IngredientSerializer()
    );
  }

  setActiveIngredientList(): Observable<Ingredient[]> {
    if (typeof this.activeIngredientList === 'undefined') {
      return this.list().pipe(
        map(ingredientList => {
          this.activeIngredientList = ingredientList;
          this.activeIngredientListSubject.next(ingredientList);
          return ingredientList;
        })
      );
    } else {
      return of(this.activeIngredientList);
    }
  }

  saveIngredient(toUpdateIngredientQuantity: IngredientQuantity[],
                 toCreateIngredientQuantity: IngredientQuantity[]): Observable<Ingredient[]> {
    // List all the new ingredient to create
    let toCreateIngredientNameList = toCreateIngredientQuantity
      .concat(toUpdateIngredientQuantity)
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

    // If there is nothing to create, return an empty observable
    if (toCreateIngredientList.length <= 0) {
      return of(undefined);
    } else {
      // Create a list of the result of the creation of the new ingredients
      const listOfIngredientObservable = toCreateIngredientList.map(
        ingredient => this.create(ingredient)
      );
      // Wait for all the API call to complete
      return forkJoin(listOfIngredientObservable).pipe(
        // Update the current ingredient list
        tap(ingredientList => {
            this.activeIngredientList = this.activeIngredientList.concat(ingredientList);
            this.activeIngredientListSubject.next(this.activeIngredientList);
          }
        )
      );
    }
  }

}
