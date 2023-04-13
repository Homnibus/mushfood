import { ModelService } from "../../core/services/model.service";
import {
  Ingredient,
  IngredientGroup as IngredientGroup,
  IngredientQuantity,
  Recipe,
} from "../../app.models";
import { IngredientGroupSerializer } from "../../app.serializers";
import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class IngredientGroupService extends ModelService<IngredientGroup> {
  public toCreateIngredientGroup: IngredientGroup[] = [];
  public toUpdateIngredientGroup: IngredientGroup[] = [];
  public toDeleteIngredientGroup: IngredientGroup[] = [];
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

  // filterIngredientList(
  //   ingredient: Ingredient | string,
  //   ingredientList: Ingredient[]
  // ): Ingredient[] {
  //   let filterValue = "";
  //   if (ingredient) {
  //     if (ingredient instanceof Ingredient) {
  //       filterValue = ingredient.name.trim().toLowerCase();
  //     } else {
  //       filterValue = ingredient.trim().toLowerCase();
  //     }
  //   }
  //   return ingredientList.filter((toFilterIngredient) =>
  //     toFilterIngredient?.name.toLowerCase().includes(filterValue)
  //   );
  // }

  // displayIngredient(ingredient?: Ingredient | string): string | undefined {
  //   if (typeof ingredient === "string") {
  //     return ingredient;
  //   } else {
  //     return ingredient ? ingredient.name : undefined;
  //   }
  // }

  setActiveIngredientGroupList(recipe: Recipe): Observable<IngredientGroup[]> {
    // If the active recipe is a new one, load the linked ingredient group
    if (this.activeRecipe !== recipe) {
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
      // Else return the current ingredient group list
    } else {
      return of(this.activeIngredientGroupList);
    }
  }

  addIngredientGroupToCreate(
    ingredientGroup: IngredientGroup
  ): IngredientGroup {
    // Set rank of ingredientGroup to last
    ingredientGroup.rank = this.activeIngredientGroupList.length + 1;
    this.toCreateIngredientGroup.push(ingredientGroup);
    this.activeIngredientGroupList.push(ingredientGroup);
    this.activeIngredientGroupListSubject.next(
      this.activeIngredientGroupList.slice()
    );
    return ingredientGroup;
  }

  addIngredientGroupToUpdate(
    ingredientGroup: IngredientGroup
  ): IngredientGroup {
    const indexOfIngredientGroupInCreateList = this.toCreateIngredientGroup
      .map((x) => x.tempId)
      .indexOf(ingredientGroup.tempId);
    const indexOfIngredientGroupInUpdateList = this.toUpdateIngredientGroup
      .map((x) => x.id)
      .indexOf(ingredientGroup.id);
    let elementPos: number;
    // If the ingredientGroup to update is already in the creation list, only update the creation list
    if (indexOfIngredientGroupInCreateList >= 0) {
      this.toCreateIngredientGroup[indexOfIngredientGroupInCreateList] =
        ingredientGroup;
      elementPos = this.activeIngredientGroupList
        .map((x) => x.tempId)
        .indexOf(ingredientGroup.tempId);
      // If the ingredientGroup to update is already in the update list, only update the update list
    } else if (indexOfIngredientGroupInUpdateList >= 0) {
      this.toUpdateIngredientGroup[indexOfIngredientGroupInUpdateList] =
        ingredientGroup;
      elementPos = this.activeIngredientGroupList
        .map((x) => x.id)
        .indexOf(ingredientGroup.id);
    } else {
      this.toUpdateIngredientGroup.push(ingredientGroup);
      elementPos = this.activeIngredientGroupList
        .map((x) => x.id)
        .indexOf(ingredientGroup.id);
    }
    this.activeIngredientGroupList[elementPos] = ingredientGroup;
    this.activeIngredientGroupList.sort((a, b) => a.rank - b.rank);
    this.activeIngredientGroupListSubject.next(
      this.activeIngredientGroupList.slice()
    );
    return ingredientGroup;
  }

  addIngredientGroupToDelete(
    ingredientGroup: IngredientGroup
  ): IngredientGroup {
    const indexOfIngredientGroupInCreateList =
      this.toCreateIngredientGroup.indexOf(ingredientGroup);
    if (indexOfIngredientGroupInCreateList >= 0) {
      this.toCreateIngredientGroup.splice(
        indexOfIngredientGroupInCreateList,
        1
      );
    } else {
      // Remove the group from the update list
      const indexOfIngredientGroupInUpdateList =
        this.toUpdateIngredientGroup.indexOf(ingredientGroup);
      if (indexOfIngredientGroupInUpdateList >= 0) {
        this.toUpdateIngredientGroup.splice(
          indexOfIngredientGroupInUpdateList,
          1
        );
      }
      this.toDeleteIngredientGroup.push(ingredientGroup);
    }
    this.activeIngredientGroupList = this.activeIngredientGroupList.filter(
      (toFilterIngredientGroup) => toFilterIngredientGroup !== ingredientGroup
    );
    // change the rank of each other ingredient Group and tag them for update
    this.updateRank(this.activeIngredientGroupList);
    this.activeIngredientGroupListSubject.next(
      this.activeIngredientGroupList.slice()
    );
    return ingredientGroup;
  }

  saveIngredientGroup(): Observable<IngredientGroup[]> {
    // return savedIngredient.pipe(
    // switchMap((newIngredientList) => {
    // Create the list off API call to delete the ingredient group
    let listOfIngredientGroupToDeleteObservable: Observable<IngredientGroup>[];
    if (this.toDeleteIngredientGroup.length > 0) {
      listOfIngredientGroupToDeleteObservable =
        this.toDeleteIngredientGroup.map((ingredientGroup) => {
          return this.delete(ingredientGroup);
        });
    } else {
      listOfIngredientGroupToDeleteObservable = [of(undefined)];
    }

    // Create the list off API call to create the ingredient group
    let listOfIngredientGroupToCreateObservable: Observable<IngredientGroup>[];
    if (this.toCreateIngredientGroup.length > 0) {
      listOfIngredientGroupToCreateObservable =
        this.toCreateIngredientGroup.map((ingredientGroup) => {
          // if (!ingredientGroup.ingredient.id) {
          //   ingredientGroup.ingredient = newIngredientList.find(
          //     (ingredient) =>
          //       ingredient.name.trim().toLowerCase() ===
          //       ingredientGroup.ingredient.name.trim().toLowerCase()
          //   );
          // }
          return this.create(ingredientGroup).pipe(
            // Update the active ingredient Group list data with the api return
            map((createdIngredientGroup) => {
              const elementPos = this.activeIngredientGroupList
                .map((x) => x.tempId)
                .indexOf(ingredientGroup.tempId);
              ingredientGroup.id = createdIngredientGroup.id;
              ingredientGroup.creationDate =
                createdIngredientGroup.creationDate;
              ingredientGroup.updateDate = createdIngredientGroup.updateDate;
              ingredientGroup.state = createdIngredientGroup.state;
              this.activeIngredientGroupList[elementPos] = ingredientGroup;
              this.activeIngredientGroupListSubject.next(
                this.activeIngredientGroupList.slice()
              );
              return ingredientGroup;
            })
          );
        });
    } else {
      listOfIngredientGroupToCreateObservable = [of(undefined)];
    }

    // Create the list off API call to update the ingredient group
    let listOfIngredientGroupToUpdateObservable: Observable<IngredientGroup>[];
    if (this.toUpdateIngredientGroup.length > 0) {
      listOfIngredientGroupToUpdateObservable =
        this.toUpdateIngredientGroup.map((ingredientGroup) => {
          // if (!ingredientGroup.ingredient.id) {
          //   ingredientGroup.ingredient = newIngredientList.find(
          //     (ingredient) =>
          //       ingredient.name.trim().toLowerCase() ===
          //       ingredientGroup.ingredient.name.trim().toLowerCase()
          //   );
          // }
          // Call the API to update the ingredient Group
          return this.update(ingredientGroup).pipe(
            // Update the active ingredient Group list data with the api return
            map((createdIngredientGroup) => {
              const elementPos = this.activeIngredientGroupList
                .map((x) => x.id)
                .indexOf(ingredientGroup.id);
              ingredientGroup.updateDate = createdIngredientGroup.updateDate;
              ingredientGroup.state = createdIngredientGroup.state;
              this.activeIngredientGroupList[elementPos] = ingredientGroup;
              this.activeIngredientGroupListSubject.next(
                this.activeIngredientGroupList.slice()
              );
              return ingredientGroup;
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
      // remove all the undefined ingredientGroup produced by the of(undefined)
      map((ingredientGroupList) =>
        ingredientGroupList.filter((ingredientGroup) => ingredientGroup)
      ),
      // );
      // }),
      tap(() => {
        // reset the list
        this.toCreateIngredientGroup = [];
        this.toUpdateIngredientGroup = [];
        this.toDeleteIngredientGroup = [];
      })
    );
  }

  // createVariant(
  //   variantRecipe: Recipe,
  //   toCopyIngredientList: IngredientGroup[]
  // ): Observable<[IngredientGroup[], Recipe]> {
  //   const newActiveIngredientGroupList = toCopyIngredientList.map(
  //     (ingredientGroup) => {
  //       const newIngredientGroup = new IngredientGroup();
  //       newIngredientGroup.tempId = Date.now();
  //       newIngredientGroup.ingredient = ingredientGroup.ingredient;
  //       newIngredientGroup.recipe = variantRecipe.id;
  //       newIngredientGroup.Group = ingredientGroup.Group;
  //       newIngredientGroup.measurementUnit =
  //         ingredientGroup.measurementUnit;
  //       return newIngredientGroup;
  //     }
  //   );
  //   return forkJoin(
  //     newActiveIngredientGroupList.map((newIngredientGroup) =>
  //       this.create(newIngredientGroup).pipe(
  //         map((createdIngredientGroup) => {
  //           const elementPos = newActiveIngredientGroupList
  //             .map((x) => x.tempId)
  //             .indexOf(newIngredientGroup.tempId);
  //           newIngredientGroup.id = createdIngredientGroup.id;
  //           newIngredientGroup.creationDate =
  //             createdIngredientGroup.creationDate;
  //           newIngredientGroup.updateDate =
  //             createdIngredientGroup.updateDate;
  //           newIngredientGroup.state = createdIngredientGroup.state;
  //           return newIngredientGroup;
  //         })
  //       )
  //     )
  //   ).pipe(
  //     map((ingredientGroupList) => [ingredientGroupList, variantRecipe])
  //   );
  // }

  resetModification() {
    this.toCreateIngredientGroup = [];
    this.toUpdateIngredientGroup = [];
    this.toDeleteIngredientGroup = [];
  }

  updateRank(ingredientGroupList: IngredientGroup[]): void {
    for (const [index, ingredientGroup] of ingredientGroupList.entries()) {
      // Retrieve the form values to create the updated entity
      const updatedIngredientGroup = Object.assign({}, ingredientGroup);
      if (updatedIngredientGroup.rank != index + 1) {
        ingredientGroup.rank = index + 1;
        updatedIngredientGroup.rank = index + 1;
        // Add the created ingredientGroup to the list of the currents recipe ingredient.
        this.addIngredientGroupToUpdate(updatedIngredientGroup);
      }
    }
  }

  findIngredientGroupOfIngredientQuantityInActiveList(
    ingredientQuantity: IngredientQuantity
  ): IngredientGroup {
    return this.activeIngredientGroupList.find(
      (ingredientGroup) =>
        ingredientGroup.id === ingredientQuantity.ingredientGroup
    );
  }

  findIngredientGroupOfIngredientQuantityIfCreated(
    ingredientQuantity: IngredientQuantity
  ): IngredientGroup {
    return this.activeIngredientGroupList.find(
      (ingredientGroup) =>
        ingredientGroup.tempId === ingredientQuantity.ingredientGroup
    );
  }
}
