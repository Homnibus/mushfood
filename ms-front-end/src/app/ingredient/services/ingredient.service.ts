import { ModelService } from "../../core/services/model.service";
import { Ingredient, IngredientQuantity } from "../../app.models";
import { IngredientSerializer } from "../../app.serializers";
import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class IngredientService extends ModelService<Ingredient> {
  private activeIngredientListSubject = new BehaviorSubject<Ingredient[]>(
    undefined
  );
  public activeIngredientList$ =
    this.activeIngredientListSubject.asObservable();
  private activeIngredientList: Ingredient[];

  constructor(http: HttpClient) {
    super(http, Ingredient, new IngredientSerializer());
  }

  /**
   * Retrieve from the backend the list of ingredient and set it as the active one
   * @returns The list of the of ingredient
   */
  initActiveIngredientList(): Observable<Ingredient[]> {
    if (typeof this.activeIngredientList === "undefined") {
      return this.list().pipe(
        map((ingredientList) => {
          this.activeIngredientList = ingredientList;
          this.activeIngredientListSubject.next(ingredientList);
          return ingredientList;
        })
      );
    } else {
      return of(this.activeIngredientList);
    }
  }

  /**
   * Return the ingredient from the active list that correspond to the input ingredient id
   * @param ingredientId The ingredient id
   * @returns The corresponding ingredient that from the active list
   */
  getIngredientById(ingredientId: number | Ingredient): Ingredient {
    if (typeof ingredientId !== "number") {
      return undefined;
    }
    if (!this.activeIngredientList) {
      return undefined;
    }

    return this.activeIngredientList.find(
      (ingredient) => ingredient.id === ingredientId
    );
  }

  /**
   * Return a list of ingredient which name contains the inputted ingredient string
   * @param ingredient The string to find in the ingredient list
   * @param ingredientList The ingredient list to filter
   * @returns An new ingredient list with only ingredient containing the ingredient string
   */
  filterIngredientList(
    ingredient: Ingredient | string,
    ingredientList: Ingredient[]
  ): Ingredient[] {
    let filterValue = "";
    if (ingredient) {
      if (ingredient instanceof Ingredient) {
        filterValue = ingredient.name.trim().toLowerCase();
      } else {
        filterValue = ingredient.trim().toLowerCase();
      }
    }
    return ingredientList.filter((toFilterIngredient) =>
      toFilterIngredient?.name.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Generate an Observable that handle the creation of the ingredient present in the ingredient list
   * by calling the backend
   * @returns An Observable to subscribe to in order to call the backend and perform the creation
   */
  saveIngredient(
    toCreateIngredientNameList: string[]
  ): Observable<Ingredient[]> {
    // Map back ingredient names to ingredient objects
    const toCreateIngredientList = toCreateIngredientNameList.map(
      (ingredientName) => {
        const ingredient = new Ingredient();
        ingredient.name = ingredientName;
        return ingredient;
      }
    );

    // If there is nothing to create, return an empty observable
    if (toCreateIngredientList.length <= 0) {
      return of(undefined);
    } else {
      // Create a list of the result of the creation of the new ingredients
      const listOfIngredientObservable = toCreateIngredientList.map(
        (toCreateIngredient) => this.create(toCreateIngredient)
      );
      // Wait for all the API call to complete
      return forkJoin(listOfIngredientObservable).pipe(
        // Update the current ingredient list
        tap((createdIngredientList) => {
          this.activeIngredientList = this.activeIngredientList.concat(
            createdIngredientList
          );
          this.activeIngredientListSubject.next(this.activeIngredientList);
        })
      );
    }
  }

  displayIngredient(ingredient?: Ingredient | string): string | undefined {
    if (typeof ingredient === "string") {
      return ingredient;
    } else {
      return ingredient ? ingredient.name : undefined;
    }
  }
}
