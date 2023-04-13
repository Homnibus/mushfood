import { AuthGuard } from "../core/guard/auth.guard";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RecipeUpdateTabsComponent } from "./recipe-update-tabs/recipe-update-tabs.component";
import { RecipeResolver } from "../recipe/services/recipe.resolver";
import { RecipeUpdateInstructionComponent } from "./recipe-update-instruction/recipe-update-instruction.component";
import { IngredientQuantityResolver } from "../ingredient/services/ingredient-quantity.resolver";
import { MeasurementUnitResolver } from "../ingredient/services/measurement-unit.resolver";
import { IngredientResolver } from "../ingredient/services/ingredient.resolver";
import { CategoryResolver } from "../category/services/category.resolver";
import { RecipeImageResolver } from "../recipe-image/services/recipe-image.resolver";
import { RecipeUpdateGeneralSettingsComponent } from "./recipe-update-general-settings/recipe-update-general-settings.component";
import { IngredientGroupResolver } from "../ingredient/services/ingredient-group.resolver";

const routes: Routes = [
  {
    path: ":slug",
    component: RecipeUpdateTabsComponent,
    resolve: { recipe: RecipeResolver },
    canActivateChild: [AuthGuard],
    data: { state: 2 },
    children: [
      {
        path: "",
        component: RecipeUpdateInstructionComponent,
        data: { state: 2.0 },
        resolve: {
          ingredientQuantityList: IngredientQuantityResolver,
          ingredientGroupList: IngredientGroupResolver,
          measurementUnitList: MeasurementUnitResolver,
          ingredientList: IngredientResolver,
        },
      },
      {
        path: "general-settings",
        component: RecipeUpdateGeneralSettingsComponent,
        data: { state: 2.1 },
        resolve: {
          recipeImage: RecipeImageResolver,
          categoryList: CategoryResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipeUpdateRoutingModule {}
