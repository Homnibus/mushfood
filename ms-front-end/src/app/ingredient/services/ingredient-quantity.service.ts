import { ModelService } from "../../core/services/model.service";
import {
  Ingredient,
  IngredientGroup,
  IngredientQuantity,
  ModelState,
  Recipe,
} from "../../app.models";
import { IngredientQuantitySerializer } from "../../app.serializers";
import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable, of, Subject } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { IngredientGroupService } from "./ingredient-group.service";
import { IngredientService } from "./ingredient.service";
import { MeasurementUnitService } from "./measurement-unit.service";

@Injectable({
  providedIn: "root",
})
export class IngredientQuantityService extends ModelService<IngredientQuantity> {
  private activeRecipe: Recipe;
  private activeIngredientQuantityList: IngredientQuantity[];
  private activeIngredientQuantityListSubject = new BehaviorSubject<
    IngredientQuantity[]
  >([]);
  public toCreateIngredientQuantityList: IngredientQuantity[] = [];
  public toUpdateIngredientQuantityList: IngredientQuantity[] = [];
  public toDeleteIngredientQuantityList: IngredientQuantity[] = [];

  public activeIngredientQuantityList$ =
    this.activeIngredientQuantityListSubject.asObservable();
  constructor(
    http: HttpClient,
    private ingredientGroupService: IngredientGroupService,
    private ingredientService: IngredientService,
    private measurementUnitService: MeasurementUnitService
  ) {
    super(http, IngredientQuantity, new IngredientQuantitySerializer());
  }

  /**
   * Retrieve from the back the list of ingredient quantity linked to a given recipe and set it as the active one
   * @param recipe The recipe from witch the ingredient quantity will be loaded
   * @returns The list of the of ingredient quantity linked the a given recipe
   */
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
          this.activeIngredientQuantityList = ingredientQuantityList.slice();
          this.activeIngredientQuantityListSubject.next(
            this.activeIngredientQuantityList
          );
          return this.activeIngredientQuantityList;
        })
      );
      // Else return the current ingredient quantities list
    } else {
      return of(this.activeIngredientQuantityList);
    }
  }

  /**
   * Add the given ingredient quantity to the creationList and to the current ingredient quantity list
   * The creation is handle with the backend when the save function is used
   * @param toCreateIngredientQuantity The ingredient quantity to create
   * @returns The ingredient quantity to create, updated with default parameters
   */
  addIngredientQuantityToCreate(
    toCreateIngredientQuantity: IngredientQuantity
  ): IngredientQuantity {
    const createdIngredientQuantity = Object.assign(
      new IngredientQuantity(),
      toCreateIngredientQuantity
    );
    // Set the default values
    createdIngredientQuantity.tempId = Date.now();
    createdIngredientQuantity.state = ModelState.NotSaved;

    // Set rank of ingredientQuantity to last
    const ingredientQuantityOfGroup = this.getIngredientQuantityOfGroup(
      this.activeIngredientQuantityList,
      toCreateIngredientQuantity.ingredientGroup
    );
    createdIngredientQuantity.rank = ingredientQuantityOfGroup.length + 1;
    // Add the ingredient quantity to the add list
    this.toCreateIngredientQuantityList.push(createdIngredientQuantity);
    // Add the ingredient quantity to the active list and emit the new list
    this.activeIngredientQuantityList.push(createdIngredientQuantity);
    this.activeIngredientQuantityListSubject.next(
      this.activeIngredientQuantityList.slice()
    );

    return createdIngredientQuantity;
  }

  /**
   * Add the given ingredient quantity to the updateList and update it in the current ingredient quantity list
   * The update is handle with the backend when the save function is used
   * @param toUpdateIngredientQuantity The ingredient quantity to update
   * @returns The ingredient quantity to update, updated with default parameters
   */
  addIngredientQuantityToUpdate(
    toUpdateIngredientQuantity: IngredientQuantity
  ): IngredientQuantity {
    const updatedIngredientQuantity = Object.assign(
      new IngredientQuantity(),
      toUpdateIngredientQuantity
    );

    // Look into the delete list for the ingredient quantity to update
    const indexOfIngredientQuantityInDeleteList =
      this.toDeleteIngredientQuantityList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === updatedIngredientQuantity.getId()
      );
    // If the ingredientQuantity to update is already in the delete list do nothing and return
    if (indexOfIngredientQuantityInDeleteList >= 0) {
      return updatedIngredientQuantity;
    }

    // Set the default values
    updatedIngredientQuantity.state = ModelState.NotSaved;

    // Look into the creation list for the ingredient quantity to update
    const indexOfIngredientQuantityInCreateList =
      this.toCreateIngredientQuantityList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === updatedIngredientQuantity.getId()
      );
    // Look into the update list for the ingredient quantity to update
    const indexOfIngredientQuantityInUpdateList =
      this.toUpdateIngredientQuantityList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === updatedIngredientQuantity.getId()
      );
    // If the ingredientQuantity to update is already in the creation list, only update the creation list
    if (indexOfIngredientQuantityInCreateList >= 0) {
      this.toCreateIngredientQuantityList[
        indexOfIngredientQuantityInCreateList
      ] = updatedIngredientQuantity;
      // If the ingredientQuantity to update is already in the update list, only update the update list
    } else if (indexOfIngredientQuantityInUpdateList >= 0) {
      this.toUpdateIngredientQuantityList[
        indexOfIngredientQuantityInUpdateList
      ] = updatedIngredientQuantity;
      // If the ingredientQuantity is not in any list, add it to the update list
    } else {
      this.toUpdateIngredientQuantityList.push(updatedIngredientQuantity);
    }

    // Update the ingredient quantity in the active list
    const indexOfIngredientQuantityInActiveList =
      this.activeIngredientQuantityList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === updatedIngredientQuantity.getId()
      );
    this.activeIngredientQuantityList[indexOfIngredientQuantityInActiveList] =
      updatedIngredientQuantity;

    // Emit the new active ingredient quantity list
    this.activeIngredientQuantityListSubject.next(
      this.activeIngredientQuantityList.slice()
    );

    return updatedIngredientQuantity;
  }

  /**
   * Add the given ingredient quantity to the deleteList and remove it from the current ingredient quantity list
   * The deletion is handle with the backend when the save function is used
   * @param toDeleteIngredientQuantity The ingredient quantity to delete
   * @returns The ingredient quantity to delete, updated with default parameters
   */
  addIngredientQuantityToDelete(
    toDeleteIngredientQuantity: IngredientQuantity
  ): IngredientQuantity {
    const deletedIngredientQuantity = Object.assign(
      new IngredientQuantity(),
      toDeleteIngredientQuantity
    );

    // Look into the delete list for the ingredient quantity to delete
    const indexOfIngredientQuantityInDeleteList =
      this.toDeleteIngredientQuantityList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === deletedIngredientQuantity.getId()
      );
    // If the ingredientQuantity to delete is already in the delete list do nothing and return
    if (indexOfIngredientQuantityInDeleteList >= 0) {
      return deletedIngredientQuantity;
    }

    // Look into the create list for the ingredient quantity to update
    const indexOfIngredientQuantityInCreateList =
      this.toCreateIngredientQuantityList.findIndex(
        (ingredientQuantity) =>
          ingredientQuantity.getId() === deletedIngredientQuantity.getId()
      );
    // If the ingredientQuantity to update is already in the creation list, remove it
    if (indexOfIngredientQuantityInCreateList >= 0) {
      this.toCreateIngredientQuantityList.splice(
        indexOfIngredientQuantityInCreateList,
        1
      );
    }

    // Look into the update list for the ingredient quantity to update
    const indexOfIngredientQuantityInUpdateList =
      this.toUpdateIngredientQuantityList.findIndex(
        (ingredientQuantity) =>
          ingredientQuantity.getId() === deletedIngredientQuantity.getId()
      );
    // If the ingredientQuantity to update is already in the creation list, remove it
    if (indexOfIngredientQuantityInUpdateList >= 0) {
      this.toUpdateIngredientQuantityList.splice(
        indexOfIngredientQuantityInUpdateList,
        1
      );
    }

    // Set the default values
    deletedIngredientQuantity.state = ModelState.NotSaved;

    // Add the ingredient quantity to the delete list
    this.toDeleteIngredientQuantityList.push(deletedIngredientQuantity);

    // Remove the ingredient quantity from the active list
    this.activeIngredientQuantityList =
      this.activeIngredientQuantityList.filter(
        (toFilterIngredientQuantity) =>
          toFilterIngredientQuantity.getId() !==
          deletedIngredientQuantity.getId()
      );

    // Update the rank of the other ingredient quantity of the group
    const ingredientQuantityWithRankToUpdateList =
      this.getIngredientQuantityOfGroup(
        this.activeIngredientQuantityList,
        deletedIngredientQuantity.ingredientGroup
      );
    this.updateRank(ingredientQuantityWithRankToUpdateList);

    // Emit the new ingredient quantity active list
    this.activeIngredientQuantityListSubject.next(
      this.activeIngredientQuantityList.slice()
    );
    return deletedIngredientQuantity;
  }

  /**
   * Generate an Observable that handle the deletion of the ingredient quantity present in the ingredient quantity list by calling the backend
   * @returns An Observable to subscribe to in order to call the backend and perform the deletion
   */
  saveIngredientQuantityToDelete(): Observable<IngredientQuantity[]> {
    // Create the list off API call to delete the ingredient quantity
    let listOfIngredientQuantityToDeleteObservable: Observable<IngredientQuantity>[];
    if (this.toDeleteIngredientQuantityList.length > 0) {
      listOfIngredientQuantityToDeleteObservable =
        this.toDeleteIngredientQuantityList.map((ingredientQuantity) => {
          return this.delete(ingredientQuantity);
        });
    } else {
      // If there is no ingredient quantity to delete, return an empty observable
      listOfIngredientQuantityToDeleteObservable = [of(undefined)];
    }
    return forkJoin(listOfIngredientQuantityToDeleteObservable).pipe(
      tap(() => {
        // Reset the delete ingredient list
        this.toDeleteIngredientQuantityList = [];
      })
    );
  }

  /**
   * Generate an Observable that handle the creation and update of the ingredient quantity present in the ingredient quantity list
   * by calling the backend
   * @param savedIngredient The Observable that return the saved ingredient after calling the backend
   * @param savedIngredientGroup The Observable that return the saved group after calling the backend
   * @returns An Observable to subscribe to in order to call the backend and perform the creation and the update
   */
  saveIngredientQuantity(
    savedIngredient: Observable<Ingredient[]>,
    savedIngredientGroup: Observable<IngredientGroup[]>
  ): Observable<IngredientQuantity[]> {
    return forkJoin([savedIngredient, savedIngredientGroup]).pipe(
      switchMap(([newIngredientList, newIngredientGroupList]) => {
        //TODO : don't use the return of the observable but call the service

        // Create the list off API call to create the new the ingredient quantity
        let listOfIngredientQuantityToCreateObservable: Observable<IngredientQuantity>[];
        if (this.toCreateIngredientQuantityList.length > 0) {
          listOfIngredientQuantityToCreateObservable =
            // Loop over the ingredient quantity to create
            this.toCreateIngredientQuantityList.map(
              (toCreateIngredientQuantity) => {
                // Replace the ingredient if it was created by the saveIngredientObservable
                if (!toCreateIngredientQuantity.ingredient.id) {
                  toCreateIngredientQuantity.ingredient =
                    newIngredientList.find(
                      (ingredient) =>
                        ingredient.name.trim().toLowerCase() ===
                        toCreateIngredientQuantity.ingredient.name
                          .trim()
                          .toLowerCase()
                    );
                }
                // Replace the group if it was created by the saveIngredientGroupObservable
                const newIngredientGroup =
                  this.ingredientGroupService.findIngredientGroupOfIngredientQuantityIfCreated(
                    toCreateIngredientQuantity
                  );
                if (newIngredientGroup) {
                  toCreateIngredientQuantity.ingredientGroup =
                    newIngredientGroup.id;
                }
                return this.create(toCreateIngredientQuantity).pipe(
                  // Update the active ingredient quantity list with the api return
                  map((createdIngredientQuantity) => {
                    const createdIngredientQuantityPosition =
                      this.activeIngredientQuantityList.findIndex(
                        (toFindIngredientQuantity) =>
                          toFindIngredientQuantity.getId() ===
                          toCreateIngredientQuantity.getId()
                      );
                    // Keep the temp ID to update the mentions
                    createdIngredientQuantity.tempId =
                      toCreateIngredientQuantity.tempId;
                    // Retrieve the ingredient as the update API return only an id
                    createdIngredientQuantity.ingredient =
                      this.ingredientService.getIngredientById(
                        createdIngredientQuantity.ingredient
                      );
                    // Retrieve the measurement unit as the update API return only an id
                    createdIngredientQuantity.measurementUnit =
                      this.measurementUnitService.getMeasurementUnitById(
                        createdIngredientQuantity.measurementUnit
                      );

                    // Update the ingredient quantity in the current
                    this.activeIngredientQuantityList[
                      createdIngredientQuantityPosition
                    ] = createdIngredientQuantity;
                    // Sort the active ingredient quantity list
                    this.activeIngredientQuantityList.sort(
                      (a, b) => a.rank - b.rank
                    );
                    // Emit the new list value
                    this.activeIngredientQuantityListSubject.next(
                      this.activeIngredientQuantityList.slice()
                    );
                    return createdIngredientQuantity;
                  })
                );
              }
            );
        } else {
          listOfIngredientQuantityToCreateObservable = [of(undefined)];
        }
        // Create the list off API call to update the ingredient quantity
        let listOfIngredientQuantityToUpdateObservable: Observable<IngredientQuantity>[];
        if (this.toUpdateIngredientQuantityList.length > 0) {
          listOfIngredientQuantityToUpdateObservable =
            this.toUpdateIngredientQuantityList.map(
              (toUpdateIngredientQuantity) => {
                // For each ingredientQuantity, check if the ingredient needed to be create and, if it's the case, replace it with
                // the one created by saveIngredientObservable.
                if (!toUpdateIngredientQuantity.ingredient.id) {
                  toUpdateIngredientQuantity.ingredient =
                    newIngredientList.find(
                      (ingredient) =>
                        ingredient.name.trim().toLowerCase() ===
                        toUpdateIngredientQuantity.ingredient.name
                          .trim()
                          .toLowerCase()
                    );
                }
                // For each ingredientQuantity, check if the ingredient group needed to be create and, if it's the case, replace it with
                // the one created by saveIngredientGroupObservable.
                const newIngredientGroup =
                  this.ingredientGroupService.findIngredientGroupOfIngredientQuantityIfCreated(
                    toUpdateIngredientQuantity
                  );
                if (newIngredientGroup) {
                  toUpdateIngredientQuantity.ingredientGroup =
                    newIngredientGroup.id;
                }
                // Call the API to update the ingredient quantity
                return this.update(toUpdateIngredientQuantity).pipe(
                  // Update the active ingredient quantity list with the api return
                  map((updatedIngredientQuantity) => {
                    const updatedIngredientQuantityPosition =
                      this.activeIngredientQuantityList.findIndex(
                        (toFindIngredientQuantity) =>
                          toFindIngredientQuantity.getId() ===
                          toUpdateIngredientQuantity.getId()
                      );
                    // Retrieve the ingredient as the update API return only an id
                    updatedIngredientQuantity.ingredient =
                      this.ingredientService.getIngredientById(
                        updatedIngredientQuantity.ingredient
                      );
                    // Retrieve the measurement unit as the update API return only an id
                    updatedIngredientQuantity.measurementUnit =
                      this.measurementUnitService.getMeasurementUnitById(
                        updatedIngredientQuantity.measurementUnit
                      );
                    // Update the active ingredient quantity list
                    this.activeIngredientQuantityList[
                      updatedIngredientQuantityPosition
                    ] = updatedIngredientQuantity;
                    // Sort the active ingredient quantity list
                    this.activeIngredientQuantityList.sort(
                      (a, b) => a.rank - b.rank
                    );
                    // Emit the new list value
                    this.activeIngredientQuantityListSubject.next(
                      this.activeIngredientQuantityList.slice()
                    );
                    return updatedIngredientQuantity;
                  })
                );
              }
            );
        } else {
          listOfIngredientQuantityToUpdateObservable = [of(undefined)];
        }
        return forkJoin(
          listOfIngredientQuantityToCreateObservable.concat(
            listOfIngredientQuantityToUpdateObservable
          )
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
        // Reset the list of creation and update
        this.toCreateIngredientQuantityList = [];
        this.toUpdateIngredientQuantityList = [];
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
    this.toCreateIngredientQuantityList = [];
    this.toUpdateIngredientQuantityList = [];
    this.toDeleteIngredientQuantityList = [];
  }

  updateRank(ingredientQuantityList: IngredientQuantity[]): void {
    for (const [
      index,
      ingredientQuantity,
    ] of ingredientQuantityList.entries()) {
      // Retrieve the form values to create the updated entity
      const updatedIngredientQuantity = Object.assign(
        new IngredientQuantity(),
        ingredientQuantity
      );

      // Update the rank of the ingredient quantity if needed
      // The rank start at 1 and not at 0
      if (updatedIngredientQuantity.rank != index + 1) {
        updatedIngredientQuantity.rank = index + 1;
        ingredientQuantity.rank = index + 1;
        // Add the ingredientQuantity to the list of ingredientQuantity to update.
        this.addIngredientQuantityToUpdate(updatedIngredientQuantity);
      }
    }
  }

  //TODO : ajouter des commentaire et la doc
  updateGroup(
    ingredientQuantity: IngredientQuantity,
    ingredientGroup: IngredientGroup
  ): void {
    const updatedIngredientQuantity = Object.assign(
      new IngredientQuantity(),
      ingredientQuantity
    );

    // Update the group of the ingredient quantity
    updatedIngredientQuantity.ingredientGroup = ingredientGroup.getId();
    ingredientQuantity.ingredientGroup = ingredientGroup.getId();
    // Add the ingredientQuantity to the list of ingredientQuantity to update.
    this.addIngredientQuantityToUpdate(updatedIngredientQuantity);
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

  getIngredientQuantityOfGroup(
    ingredientQuantityList: IngredientQuantity[],
    ingredientGroupId: number
  ): IngredientQuantity[] {
    return ingredientQuantityList.filter(
      (toFilterIngredientQuantity) =>
        toFilterIngredientQuantity.ingredientGroup === ingredientGroupId
    );
  }
}
