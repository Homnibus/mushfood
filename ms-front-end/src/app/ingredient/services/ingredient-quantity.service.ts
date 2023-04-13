import { ModelService } from "../../core/services/model.service";
import {
  Ingredient,
  IngredientGroup,
  IngredientQuantity,
  Recipe,
} from "../../app.models";
import { IngredientQuantitySerializer } from "../../app.serializers";
import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { IngredientGroupService } from "./ingredient-group.service";

@Injectable({
  providedIn: "root",
})
export class IngredientQuantityService extends ModelService<IngredientQuantity> {
  public toCreateIngredientQuantity: IngredientQuantity[] = [];
  public toUpdateIngredientQuantity: IngredientQuantity[] = [];
  public toDeleteIngredientQuantity: IngredientQuantity[] = [];
  private activeIngredientQuantityListSubject = new BehaviorSubject<
    IngredientQuantity[]
  >(undefined);
  public activeIngredientQuantityList$ =
    this.activeIngredientQuantityListSubject.asObservable();
  private activeIngredientQuantityList: IngredientQuantity[];
  private activeRecipe: Recipe;

  constructor(
    http: HttpClient,
    private ingredientGroupService: IngredientGroupService
  ) {
    super(http, IngredientQuantity, new IngredientQuantitySerializer());
  }

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

  displayIngredient(ingredient?: Ingredient | string): string | undefined {
    if (typeof ingredient === "string") {
      return ingredient;
    } else {
      return ingredient ? ingredient.name : undefined;
    }
  }

  setActiveIngredientQuantityList(
    recipe: Recipe
  ): Observable<IngredientQuantity[]> {
    // If the active recipe is a new one, load the linked ingredient quantities
    if (this.activeRecipe !== recipe) {
      this.activeRecipe = recipe;
      return this.filteredList(
        `ingredient_group__recipe__id=${recipe.id}`
      ).pipe(
        map((ingredientQuantityList) => {
          this.activeIngredientQuantityList = ingredientQuantityList;
          this.activeIngredientQuantityListSubject.next(
            ingredientQuantityList.slice()
          );
          return ingredientQuantityList;
        })
      );
      // Else return the current ingredient quantities list
    } else {
      return of(this.activeIngredientQuantityList);
    }
  }

  addIngredientQuantityToCreate(
    ingredientQuantity: IngredientQuantity
  ): IngredientQuantity {
    // Set rank of ingredientQuantity to last
    ingredientQuantity.rank =
      this.activeIngredientQuantityList.filter(
        (toFilterIngredientQuantity) =>
          toFilterIngredientQuantity.ingredientGroup ===
          ingredientQuantity.ingredientGroup
      ).length + 1;
    this.toCreateIngredientQuantity.push(ingredientQuantity);
    this.activeIngredientQuantityList.push(ingredientQuantity);
    this.activeIngredientQuantityListSubject.next(
      this.activeIngredientQuantityList.slice()
    );
    return ingredientQuantity;
  }

  addIngredientQuantityToUpdate(
    ingredientQuantity: IngredientQuantity
  ): IngredientQuantity {
    const indexOfIngredientQuantityInCreateList =
      this.toCreateIngredientQuantity
        .map((x) => x.tempId)
        .indexOf(ingredientQuantity.tempId);
    const indexOfIngredientQuantityInUpdateList =
      this.toUpdateIngredientQuantity
        .map((x) => x.id)
        .indexOf(ingredientQuantity.id);
    let elementPos: number;
    // If the ingredientQuantity to update is already in the creation list, only update the creation list
    if (indexOfIngredientQuantityInCreateList >= 0) {
      this.toCreateIngredientQuantity[indexOfIngredientQuantityInCreateList] =
        ingredientQuantity;
      elementPos = this.activeIngredientQuantityList
        .map((x) => x.tempId)
        .indexOf(ingredientQuantity.tempId);
      // If the ingredientQuantity to update is already in the update list, only update the update list
    } else if (indexOfIngredientQuantityInUpdateList >= 0) {
      this.toUpdateIngredientQuantity[indexOfIngredientQuantityInUpdateList] =
        ingredientQuantity;
      elementPos = this.activeIngredientQuantityList
        .map((x) => x.id)
        .indexOf(ingredientQuantity.id);
    } else {
      this.toUpdateIngredientQuantity.push(ingredientQuantity);
      elementPos = this.activeIngredientQuantityList
        .map((x) => x.id)
        .indexOf(ingredientQuantity.id);
    }
    this.activeIngredientQuantityList[elementPos] = ingredientQuantity;
    this.activeIngredientQuantityList.sort((a, b) => a.rank - b.rank);
    this.activeIngredientQuantityListSubject.next(
      this.activeIngredientQuantityList.slice()
    );
    return ingredientQuantity;
  }

  addIngredientQuantityToDelete(
    ingredientQuantity: IngredientQuantity
  ): IngredientQuantity {
    // Remove the ingredient from the creation list
    const indexOfIngredientQuantityInCreateList =
      this.toCreateIngredientQuantity.indexOf(ingredientQuantity);
    if (indexOfIngredientQuantityInCreateList >= 0) {
      this.toCreateIngredientQuantity.splice(
        indexOfIngredientQuantityInCreateList,
        1
      );
    } else {
      // Remove the ingredient from the update list
      const indexOfIngredientQuantityInUpdateList =
        this.toUpdateIngredientQuantity.indexOf(ingredientQuantity);
      if (indexOfIngredientQuantityInUpdateList >= 0) {
        this.toUpdateIngredientQuantity.splice(
          indexOfIngredientQuantityInUpdateList,
          1
        );
      }
      // Add the ingredient quantity to the delete list
      this.toDeleteIngredientQuantity.push(ingredientQuantity);
    }
    // Remove the ingredient quantity from the active list
    this.activeIngredientQuantityList =
      this.activeIngredientQuantityList.filter(
        (toFilterIngredientQuantity) =>
          toFilterIngredientQuantity.id !== ingredientQuantity.id ||
          toFilterIngredientQuantity.tempId !== ingredientQuantity.tempId
      );

    // Update the rank of the other ingredient quantity of the group
    const ingredientQuantityWithRankToUpdateList =
      this.activeIngredientQuantityList.filter(
        (ingredientQuantityToFilter) =>
          ingredientQuantityToFilter.ingredientGroup ===
          ingredientQuantity.ingredientGroup
      );
    this.updateRank(ingredientQuantityWithRankToUpdateList);

    // Emit the new ingredient quantity active list
    this.activeIngredientQuantityListSubject.next(
      this.activeIngredientQuantityList.slice()
    );
    return ingredientQuantity;
  }

  saveIngredientQuantityToDelete(): Observable<IngredientQuantity[]> {
    // Create the list off API call to delete the ingredient quantity
    let listOfIngredientQuantityToDeleteObservable: Observable<IngredientQuantity>[];
    if (this.toDeleteIngredientQuantity.length > 0) {
      listOfIngredientQuantityToDeleteObservable =
        this.toDeleteIngredientQuantity.map((ingredientQuantity) => {
          return this.delete(ingredientQuantity);
        });
    } else {
      listOfIngredientQuantityToDeleteObservable = [of(undefined)];
    }
    return forkJoin(listOfIngredientQuantityToDeleteObservable).pipe(
      tap(() => {
        // reset the list
        this.toDeleteIngredientQuantity = [];
      })
    );
  }

  saveIngredientQuantity(
    savedIngredient: Observable<Ingredient[]>,
    savedIngredientGroup: Observable<IngredientGroup[]>
  ): Observable<IngredientQuantity[]> {
    return forkJoin([savedIngredient, savedIngredientGroup]).pipe(
      switchMap(([newIngredientList, newIngredientGroupList]) => {
        // // Create the list off API call to delete the ingredient quantity
        // let listOfIngredientQuantityToDeleteObservable: Observable<IngredientQuantity>[];
        // if (this.toDeleteIngredientQuantity.length > 0) {
        //   listOfIngredientQuantityToDeleteObservable =
        //     this.toDeleteIngredientQuantity.map((ingredientQuantity) => {
        //       return this.delete(ingredientQuantity);
        //     });
        // } else {
        //   listOfIngredientQuantityToDeleteObservable = [of(undefined)];
        // }
        // Create the list off API call to create the new the ingredient quantity
        let listOfIngredientQuantityToCreateObservable: Observable<IngredientQuantity>[];
        if (this.toCreateIngredientQuantity.length > 0) {
          listOfIngredientQuantityToCreateObservable =
            this.toCreateIngredientQuantity.map((ingredientQuantity) => {
              // For each ingredientQuantity, check if the ingredient needed to be create and, if it's the case, replace it with
              // the one created by saveIngredientObservable.
              if (!ingredientQuantity.ingredient.id) {
                ingredientQuantity.ingredient = newIngredientList.find(
                  (ingredient) =>
                    ingredient.name.trim().toLowerCase() ===
                    ingredientQuantity.ingredient.name.trim().toLowerCase()
                );
              }
              // For each ingredientQuantity, check if the ingredient group needed to be create and, if it's the case, replace it with
              // the one created by saveIngredientGroupObservable.
              const newIngredientGroup =
                this.ingredientGroupService.findIngredientGroupOfIngredientQuantityIfCreated(
                  ingredientQuantity
                );
              if (newIngredientGroup) {
                ingredientQuantity.ingredientGroup = newIngredientGroup.id;
              }
              return this.create(ingredientQuantity).pipe(
                // Update the active ingredient quantity list with the api return
                map((createdIngredientQuantity) => {
                  const elementPos = this.activeIngredientQuantityList
                    .map((x) => x.tempId)
                    .indexOf(ingredientQuantity.tempId);
                  ingredientQuantity.id = createdIngredientQuantity.id;
                  ingredientQuantity.creationDate =
                    createdIngredientQuantity.creationDate;
                  ingredientQuantity.updateDate =
                    createdIngredientQuantity.updateDate;
                  ingredientQuantity.state = createdIngredientQuantity.state;
                  this.activeIngredientQuantityList[elementPos] =
                    ingredientQuantity;
                  this.activeIngredientQuantityListSubject.next(
                    this.activeIngredientQuantityList.slice()
                  );
                  return ingredientQuantity;
                })
              );
            });
        } else {
          listOfIngredientQuantityToCreateObservable = [of(undefined)];
        }
        // Create the list off API call to update the ingredient quantity
        let listOfIngredientQuantityToUpdateObservable: Observable<IngredientQuantity>[];
        if (this.toUpdateIngredientQuantity.length > 0) {
          listOfIngredientQuantityToUpdateObservable =
            this.toUpdateIngredientQuantity.map((ingredientQuantity) => {
              // For each ingredientQuantity, check if the ingredient needed to be create and, if it's the case, replace it with
              // the one created by saveIngredientObservable.
              if (!ingredientQuantity.ingredient.id) {
                ingredientQuantity.ingredient = newIngredientList.find(
                  (ingredient) =>
                    ingredient.name.trim().toLowerCase() ===
                    ingredientQuantity.ingredient.name.trim().toLowerCase()
                );
              }
              // For each ingredientQuantity, check if the ingredient group needed to be create and, if it's the case, replace it with
              // the one created by saveIngredientGroupObservable.
              const newIngredientGroup =
                this.ingredientGroupService.findIngredientGroupOfIngredientQuantityIfCreated(
                  ingredientQuantity
                );
              if (newIngredientGroup) {
                ingredientQuantity.ingredientGroup = newIngredientGroup.id;
              }
              // Call the API to update the ingredient quantity
              return this.update(ingredientQuantity).pipe(
                // Update the active ingredient quantity list with the api return
                map((createdIngredientQuantity) => {
                  const elementPos = this.activeIngredientQuantityList
                    .map((x) => x.id)
                    .indexOf(ingredientQuantity.id);
                  ingredientQuantity.updateDate =
                    createdIngredientQuantity.updateDate;
                  ingredientQuantity.state = createdIngredientQuantity.state;
                  this.activeIngredientQuantityList[elementPos] =
                    ingredientQuantity;
                  this.activeIngredientQuantityListSubject.next(
                    this.activeIngredientQuantityList.slice()
                  );
                  return ingredientQuantity;
                })
              );
            });
        } else {
          listOfIngredientQuantityToUpdateObservable = [of(undefined)];
        }
        return forkJoin(
          listOfIngredientQuantityToCreateObservable.concat(
            listOfIngredientQuantityToUpdateObservable
          )
          // .concat(listOfIngredientQuantityToDeleteObservable)
        ).pipe(
          // remove all the undefined ingredientQuantity produced by the of(undefined)
          map((ingredientQuantityList) =>
            ingredientQuantityList.filter(
              (ingredientQuantity) => ingredientQuantity
            )
          )
        );
      }),
      tap(() => {
        // reset the list
        this.toCreateIngredientQuantity = [];
        this.toUpdateIngredientQuantity = [];
        // this.toDeleteIngredientQuantity = [];
      })
    );
  }

  createVariant(
    variantRecipe: Recipe,
    toCopyIngredientList: IngredientQuantity[]
  ): Observable<[IngredientQuantity[], Recipe]> {
    const newActiveIngredientQuantityList = toCopyIngredientList.map(
      (ingredientQuantity) => {
        const newIngredientQuantity = new IngredientQuantity();
        newIngredientQuantity.tempId = Date.now();
        newIngredientQuantity.ingredient = ingredientQuantity.ingredient;
        //TODO : mettre a jour la création de variante avec les groupes et les rangs
        // newIngredientQuantity.recipe = variantRecipe.id;
        newIngredientQuantity.quantity = ingredientQuantity.quantity;
        newIngredientQuantity.measurementUnit =
          ingredientQuantity.measurementUnit;
        return newIngredientQuantity;
      }
    );
    return forkJoin(
      newActiveIngredientQuantityList.map((newIngredientQuantity) =>
        this.create(newIngredientQuantity).pipe(
          map((createdIngredientQuantity) => {
            const elementPos = newActiveIngredientQuantityList
              .map((x) => x.tempId)
              .indexOf(newIngredientQuantity.tempId);
            newIngredientQuantity.id = createdIngredientQuantity.id;
            newIngredientQuantity.creationDate =
              createdIngredientQuantity.creationDate;
            newIngredientQuantity.updateDate =
              createdIngredientQuantity.updateDate;
            newIngredientQuantity.state = createdIngredientQuantity.state;
            return newIngredientQuantity;
          })
        )
      )
    ).pipe(
      map((ingredientQuantityList) => [ingredientQuantityList, variantRecipe])
    );
  }

  resetModification() {
    this.toCreateIngredientQuantity = [];
    this.toUpdateIngredientQuantity = [];
    this.toDeleteIngredientQuantity = [];
  }

  updateRank(ingredientQuantityList: IngredientQuantity[]): void {
    for (const [
      index,
      ingredientQuantity,
    ] of ingredientQuantityList.entries()) {
      // Retrieve the form values to create the updated entity
      const updatedIngredientQuantity = Object.assign({}, ingredientQuantity);

      // Update the rank of the ingredient quantity if needed
      if (updatedIngredientQuantity.rank != index + 1) {
        updatedIngredientQuantity.rank = index + 1;
        ingredientQuantity.rank = index + 1;
        // Add the ingredientQuantity to the list of ingredientQuantity to update.
        this.addIngredientQuantityToUpdate(updatedIngredientQuantity);
      }
    }
  }

  updateGroup(
    ingredientQuantityList: IngredientQuantity[],
    ingredientGroup: IngredientGroup
  ): void {
    for (const [
      index,
      ingredientQuantity,
    ] of ingredientQuantityList.entries()) {
      // Retrieve the form values to create the updated entity
      const updatedIngredientQuantity = Object.assign({}, ingredientQuantity);

      // Update the group of the ingredient quantity if needed
      if (
        updatedIngredientQuantity.ingredientGroup != ingredientGroup.id &&
        updatedIngredientQuantity.ingredientGroup != ingredientGroup.tempId
      ) {
        updatedIngredientQuantity.ingredientGroup = ingredientGroup.id
          ? ingredientGroup.id
          : ingredientGroup.tempId;
        ingredientQuantity.ingredientGroup = ingredientGroup.id
          ? ingredientGroup.id
          : ingredientGroup.tempId;

        // Add the ingredientQuantity to the list of ingredientQuantity to update.
        this.addIngredientQuantityToUpdate(updatedIngredientQuantity);
      }
    }
  }
}
