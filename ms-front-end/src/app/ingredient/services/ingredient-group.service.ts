import { ModelService } from "../../core/services/model.service";
import {
  IngredientGroup as IngredientGroup,
  IngredientQuantity,
  ModelState,
  Recipe,
} from "../../app.models";
import { IngredientGroupSerializer } from "../../app.serializers";
import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class IngredientGroupService extends ModelService<IngredientGroup> {
  private toCreateIngredientGroupList: IngredientGroup[] = [];
  private toUpdateIngredientGroupList: IngredientGroup[] = [];
  private toDeleteIngredientGroupList: IngredientGroup[] = [];
  private activeIngredientGroupListSubject = new BehaviorSubject<
    IngredientGroup[]
  >(undefined);
  public activeIngredientGroupList$ =
    this.activeIngredientGroupListSubject.asObservable();
  private activeIngredientGroupList: IngredientGroup[];
  private activeRecipe: Recipe;

  constructor(http: HttpClient) {
    super(http, IngredientGroup, new IngredientGroupSerializer());
  }

  /**
   * Retrieve from the backend the list of ingredient group linked to a given recipe and set it as the active one
   * @param recipe The recipe from witch the ingredient group will be loaded
   * @returns The list of the of ingredient group linked the a given recipe
   */
  initActiveIngredientGroupList(
    recipe: Recipe,
    keepActiveList: boolean = false
  ): Observable<IngredientGroup[]> {
    if (this.activeRecipe === recipe && keepActiveList) {
      return of(this.activeIngredientGroupList);
    } else {
      this.activeRecipe = recipe;
      return this.filteredList(`recipe__id=${recipe.id}`).pipe(
        map((ingredientGroupList) => {
          this.activeIngredientGroupList = ingredientGroupList;
          this.activeIngredientGroupListSubject.next(
            ingredientGroupList.slice()
          );
          return ingredientGroupList;
        })
      );
    }
  }

  /**
   * Return the ingredient group linked to a given ingredient quantity from the active list
   * @param ingredientQuantity The ingredient quantity of which to find the ingredient group
   * @returns The ingredient group that are is linked to the ingredient quantity in the active list
   */
  getIngredientGroupOfIngredientQuantityInActiveList(
    ingredientQuantity: IngredientQuantity
  ): IngredientGroup {
    return this.activeIngredientGroupList.find(
      (ingredientGroup) =>
        ingredientGroup.id === ingredientQuantity.ingredientGroup
    );
  }

  /**
   * Return an ingredient group that was created by the backend using the ingredient group id that was created in local
   * @param ingredientQuantity The ingredient quantity to which retrieve the newly created ingredient group
   * @returns The ingredient group newly created by the backend linked to the input ingredient quantity
   */
  getIngredientGroupOfIngredientQuantityIfCreated(
    ingredientQuantity: IngredientQuantity
  ): IngredientGroup {
    return this.activeIngredientGroupList.find(
      (ingredientGroup) =>
        ingredientGroup.tempId === ingredientQuantity.ingredientGroup
    );
  }

  /**
   * Add the given ingredient group to the creationList and to the current ingredient group list
   * The creation is handle with the backend when the save function is used
   * @param toCreateIngredientGroup The ingredient group to create
   * @returns The ingredient group to create, updated with default parameters
   */
  addIngredientGroupToCreate(
    toCreateIngredientGroup: IngredientGroup
  ): IngredientGroup {
    const createdIngredientGroup = Object.assign(
      new IngredientGroup(),
      toCreateIngredientGroup
    );
    // Set the default values
    createdIngredientGroup.tempId = Date.now();
    createdIngredientGroup.state = ModelState.NotSaved;
    // Set rank of ingredientGroup to last
    createdIngredientGroup.rank = this.activeIngredientGroupList.length + 1;
    // Add the ingredient group to the add list
    this.toCreateIngredientGroupList.push(createdIngredientGroup);
    // Add the ingredient group to the active list and emit the new list
    this.activeIngredientGroupList.push(createdIngredientGroup);
    this.activeIngredientGroupListSubject.next(
      this.activeIngredientGroupList.slice()
    );
    return createdIngredientGroup;
  }

  /**
   * Add the given ingredient group to the updateList and update it in the current ingredient quantity list
   * The update is handle with the backend when the save function is used
   * @param toUpdateIngredientGroup The ingredient group to update
   * @returns The ingredient group to update, updated with default parameters
   */
  addIngredientGroupToUpdate(
    toUpdateIngredientGroup: IngredientGroup
  ): IngredientGroup {
    const updatedIngredientGroup = Object.assign(
      new IngredientGroup(),
      toUpdateIngredientGroup
    );
    // Look into the delete list for the ingredient group to update
    const indexOfIngredientGroupInDeleteList =
      this.toDeleteIngredientGroupList.findIndex(
        (toFindIngredientGroup) =>
          toFindIngredientGroup.getId() === updatedIngredientGroup.getId()
      );
    // If the ingredient group to update is already in the delete list do nothing and return
    if (indexOfIngredientGroupInDeleteList >= 0) {
      return updatedIngredientGroup;
    }

    // Set the default values
    updatedIngredientGroup.state = ModelState.NotSaved;

    // Look into the creation list for the ingredient group to update
    const indexOfIngredientGroupInCreateList =
      this.toCreateIngredientGroupList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === updatedIngredientGroup.getId()
      );
    // Look into the update list for the ingredient group to update
    const indexOfIngredientGroupInUpdateList =
      this.toUpdateIngredientGroupList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === updatedIngredientGroup.getId()
      );
    // If the ingredient group to update is already in the creation list, only update the creation list
    if (indexOfIngredientGroupInCreateList >= 0) {
      this.toCreateIngredientGroupList[indexOfIngredientGroupInCreateList] =
        updatedIngredientGroup;
      // If the ingredient group to update is already in the update list, only update the update list
    } else if (indexOfIngredientGroupInUpdateList >= 0) {
      this.toUpdateIngredientGroupList[indexOfIngredientGroupInUpdateList] =
        updatedIngredientGroup;
      // If the ingredient group is not in any list, add it to the update list
    } else {
      this.toUpdateIngredientGroupList.push(updatedIngredientGroup);
    }

    // Update the ingredient group in the active list
    const indexOfIngredientGroupInActiveList =
      this.activeIngredientGroupList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === updatedIngredientGroup.getId()
      );
    this.activeIngredientGroupList[indexOfIngredientGroupInActiveList] =
      updatedIngredientGroup;

    // Sort the list in case any of the ranks changed
    // This should not change the list thanks to the use of the updateRank function when manipulating ranks
    this.activeIngredientGroupList.sort((a, b) => a.rank - b.rank);

    // Emit the new active ingredient group list
    this.activeIngredientGroupListSubject.next(
      this.activeIngredientGroupList.slice()
    );
    return toUpdateIngredientGroup;
  }

  /**
   * Add the given ingredient group to the deleteList and remove it from the current ingredient group list
   * The deletion is handle with the backend when the save function is used
   * @param toDeleteIngredientGroup The ingredient group to delete
   * @returns The ingredient group to delete, updated with default parameters
   */
  addIngredientGroupToDelete(
    toDeleteIngredientGroup: IngredientGroup
  ): IngredientGroup {
    const deletedIngredientGroup = Object.assign(
      new IngredientQuantity(),
      toDeleteIngredientGroup
    );

    // Look into the delete list for the ingredient group to update
    const indexOfIngredientGroupInDeleteList =
      this.toDeleteIngredientGroupList.findIndex(
        (toFindIngredientGroup) =>
          toFindIngredientGroup.getId() === deletedIngredientGroup.getId()
      );
    // If the ingredient group to update is already in the delete list do nothing and return
    if (indexOfIngredientGroupInDeleteList >= 0) {
      return deletedIngredientGroup;
    }

    // Look into the creation list for the ingredient group to update
    const indexOfIngredientGroupInCreateList =
      this.toCreateIngredientGroupList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === deletedIngredientGroup.getId()
      );
    // If the ingredientQuantity to update is already in the creation list, remove it
    if (indexOfIngredientGroupInCreateList >= 0) {
      this.toCreateIngredientGroupList.splice(
        indexOfIngredientGroupInCreateList,
        1
      );
    }

    // Look into the update list for the ingredient group to update
    const indexOfIngredientGroupInUpdateList =
      this.toUpdateIngredientGroupList.findIndex(
        (toFindIngredientQuantity) =>
          toFindIngredientQuantity.getId() === deletedIngredientGroup.getId()
      );
    // If the ingredient group to delete is already in the update list, remove it
    if (indexOfIngredientGroupInUpdateList >= 0) {
      this.toUpdateIngredientGroupList.splice(
        indexOfIngredientGroupInUpdateList,
        1
      );
    }

    // Set the default values
    deletedIngredientGroup.state = ModelState.NotSaved;

    // Add the ingredient group to the delete list
    this.toDeleteIngredientGroupList.push(deletedIngredientGroup);

    // Remove the ingredient group from the active list
    this.activeIngredientGroupList = this.activeIngredientGroupList.filter(
      (toFilterIngredientGroup) =>
        toFilterIngredientGroup.getId() !== deletedIngredientGroup.getId()
    );

    // Update the rank of each other ingredient group and tag them for update
    this.updateRankOfIngredientGroup(this.activeIngredientGroupList);

    // Emit the new ingredient group active list
    this.activeIngredientGroupListSubject.next(
      this.activeIngredientGroupList.slice()
    );
    return deletedIngredientGroup;
  }

  /**
   * Recalculate the rank of the ingredient group in the given list
   * The rank of each ingredient group will be equal to its position in the list
   * @param ingredientGroupList The ingredient group list in which the ingredient group rank must be recalculated
   */
  updateRankOfIngredientGroup(ingredientGroupList: IngredientGroup[]): void {
    // Loop over the list to update the rank
    for (const [index, ingredientGroup] of ingredientGroupList.entries()) {
      const updatedIngredientGroup = Object.assign(
        new IngredientGroup(),
        ingredientGroup
      );
      // Update the rank of the ingredient group if needed
      // The rank start at 1 and not at 0
      if (updatedIngredientGroup.rank != index + 1) {
        ingredientGroup.rank = index + 1;
        updatedIngredientGroup.rank = index + 1;
        // Add the created ingredientGroup to the update list.
        this.addIngredientGroupToUpdate(updatedIngredientGroup);
      }
    }
  }

  /**
   * Generate an Observable that handle the creation, the update and the deletion of the ingredient group present in the ingredient group list
   * by calling the backend
   * @returns An Observable to subscribe to in order to call the backend and perform the creation, update and deletion
   */
  saveIngredientGroup(): Observable<IngredientGroup[]> {
    //TODO : don't use the return of the observable but call the service

    // Create the list off API call to delete the ingredient group
    let listOfIngredientGroupToDeleteObservable: Observable<IngredientGroup>[];
    if (this.toDeleteIngredientGroupList.length > 0) {
      listOfIngredientGroupToDeleteObservable =
        this.toDeleteIngredientGroupList.map((ingredientGroup) => {
          return this.delete(ingredientGroup);
        });
    } else {
      listOfIngredientGroupToDeleteObservable = [of(undefined)];
    }

    // Create the list off API call to create the ingredient group
    let listOfIngredientGroupToCreateObservable: Observable<IngredientGroup>[];
    if (this.toCreateIngredientGroupList.length > 0) {
      listOfIngredientGroupToCreateObservable =
        this.toCreateIngredientGroupList.map((toCreateIngredientGroup) => {
          return this.create(toCreateIngredientGroup).pipe(
            // Update the active ingredient Group list data with the api return
            map((createdIngredientGroup) => {
              const createdIngredientGroupPosition =
                this.activeIngredientGroupList.findIndex(
                  (toFindIngredientGroup) =>
                    toFindIngredientGroup.getId() ===
                    toCreateIngredientGroup.getId()
                );
              // Keep the temp ID to update ingredient quantity
              createdIngredientGroup.tempId = toCreateIngredientGroup.tempId;

              // Update the ingredient group in the current list
              this.activeIngredientGroupList[createdIngredientGroupPosition] =
                createdIngredientGroup;
              // Sort the active ingredient quantity list
              // This should not change the list because it's already sorted
              this.activeIngredientGroupList.sort((a, b) => a.rank - b.rank);
              // Emit the new list value
              this.activeIngredientGroupListSubject.next(
                this.activeIngredientGroupList.slice()
              );
              return toCreateIngredientGroup;
            })
          );
        });
    } else {
      listOfIngredientGroupToCreateObservable = [of(undefined)];
    }

    // Create the list off API call to update the ingredient group
    let listOfIngredientGroupToUpdateObservable: Observable<IngredientGroup>[];
    if (this.toUpdateIngredientGroupList.length > 0) {
      listOfIngredientGroupToUpdateObservable =
        this.toUpdateIngredientGroupList.map((toUpdateIngredientGroup) => {
          // Call the API to update the ingredient Group
          return this.update(toUpdateIngredientGroup).pipe(
            // Update the active ingredient Group list data with the api return
            map((createdIngredientGroup) => {
              const updatedIngredientGroupPosition =
                this.activeIngredientGroupList.findIndex(
                  (toFindIngredientGroup) =>
                    toFindIngredientGroup.getId() ===
                    toUpdateIngredientGroup.getId()
                );
              // Update the active ingredient quantity list
              this.activeIngredientGroupList[updatedIngredientGroupPosition] =
                createdIngredientGroup;
              // Sort the active ingredient quantity list
              // This should not change the list because it's already sorted
              this.activeIngredientGroupList.sort((a, b) => a.rank - b.rank);
              // Emit the new list value
              this.activeIngredientGroupListSubject.next(
                this.activeIngredientGroupList.slice()
              );
              return toUpdateIngredientGroup;
            })
          );
        });
    } else {
      listOfIngredientGroupToUpdateObservable = [of(undefined)];
    }
    return forkJoin(
      listOfIngredientGroupToCreateObservable
        .concat(listOfIngredientGroupToUpdateObservable)
        .concat(listOfIngredientGroupToDeleteObservable)
    ).pipe(
      // Remove all the undefined ingredientGroup produced by the of(undefined)
      map((ingredientGroupList) =>
        ingredientGroupList.filter((ingredientGroup) => ingredientGroup)
      ),
      tap(() => {
        // Reset the list
        this.toCreateIngredientGroupList = [];
        this.toUpdateIngredientGroupList = [];
        this.toDeleteIngredientGroupList = [];
      })
    );
  }

  createVariant(
    createdRecipe: Recipe,
    toCopyIngredientGroupList: IngredientGroup[],
    toCopyIngredientQuantityList: IngredientQuantity[]
  ): Observable<[Recipe, IngredientQuantity[]]> {
    const toCreateIngredientGroupList = toCopyIngredientGroupList.map(
      (toCopyIngredientGroup) => {
        const toCreateIngredientGroup = Object.assign(
          new IngredientGroup(),
          toCopyIngredientGroup
        );
        toCreateIngredientGroup.id = undefined;
        toCreateIngredientGroup.tempId = Date.now();
        toCreateIngredientGroup.recipe = createdRecipe.id;
        return toCreateIngredientGroup;
      }
    );
    return forkJoin(
      toCreateIngredientGroupList.map((toCreateIngredientGroup) =>
        this.create(toCreateIngredientGroup)
      )
    ).pipe(
      map((createdIngredientGroupList) => {
        toCopyIngredientQuantityList.forEach((toUpdateIngredientQuantity) => {
          const indexOfIngredientGroup = toCopyIngredientGroupList.findIndex(
            (toFindIngredientGroup) =>
              toUpdateIngredientQuantity.ingredientGroup ===
              toFindIngredientGroup.getId()
          );
          toUpdateIngredientQuantity.ingredientGroup =
            createdIngredientGroupList[indexOfIngredientGroup].getId();
        });

        return [createdRecipe, toCopyIngredientQuantityList];
      })
    );
  }

  /**
   * Reset the working list
   */
  resetModification() {
    this.toCreateIngredientGroupList = [];
    this.toUpdateIngredientGroupList = [];
    this.toDeleteIngredientGroupList = [];
  }
}
