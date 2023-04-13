import { RecipeListComponent } from "./recipe-list/recipe-list.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RecipeDetailsComponent } from "./recipe-details/recipe-details.component";
import { RecipeIngredientQuantityResolver } from "./services/recipe-ingredient-quantity.resolver";
import { CategoryResolver } from "../category/services/category.resolver";
import { IngredientGroupResolver } from "../ingredient/services/ingredient-group.resolver";
import { RecipeResolver } from "./services/recipe.resolver";

const routes: Routes = [
  {
    path: "recipe",
    children: [
      {
        path: "",
        component: RecipeListComponent,
        resolve: { categoryList: CategoryResolver },
        data: { state: 1 },
      },
      {
        path: "edit",
        loadChildren: () =>
          import("../recipe-update/recipe-update.module").then(
            (mod) => mod.RecipeUpdateModule
          ),
      },
      {
        path: "details/:slug",
        component: RecipeDetailsComponent,
        data: { state: 3 },
        resolve: {
          recipeIngredientQuantityList: RecipeIngredientQuantityResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipeRoutingModule {}
