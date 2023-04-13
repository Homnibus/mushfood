import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { IngredientQuantity, Recipe } from "../../app.models";
import { Observable } from "rxjs";
import { RecipeService } from "./recipe.service";
import { map, switchMap } from "rxjs/operators";
import { IngredientQuantityService } from "../../ingredient/services/ingredient-quantity.service";
import { IngredientGroupService } from "src/app/ingredient/services/ingredient-group.service";

@Injectable({
  providedIn: "root",
})
export class RecipeIngredientQuantityResolver
  implements
    Resolve<{ recipe: Recipe; ingredientQuantityList: IngredientQuantity[] }>
{
  constructor(
    private recipeService: RecipeService,
    private ingredientQuantityService: IngredientQuantityService,
    private ingredientGroupService: IngredientGroupService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{
    recipe: Recipe;
    ingredientQuantityList: IngredientQuantity[];
  }> {
    return this.recipeService.setActiveRecipe(route.paramMap.get("slug")).pipe(
      switchMap((recipe) =>
        this.ingredientQuantityService
          .setActiveIngredientQuantityList(recipe)
          .pipe(
            switchMap((ingredientQuantityList) =>
              this.ingredientGroupService
                .setActiveIngredientGroupList(recipe)
                .pipe(
                  map((ingredientGroupList) => {
                    return {
                      recipe,
                      ingredientQuantityList,
                      ingredientGroupList,
                    };
                  })
                )
            )
          )
      )
    );
  }
}
