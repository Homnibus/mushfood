import { RecipeListComponent } from "./recipe-list/recipe-list.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RecipeDetailsComponent } from "./recipe-details/recipe-details.component";

const routes: Routes = [
  {
    path: "recipe",
    children: [
      {
        path: "",
        component: RecipeListComponent,
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
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipeRoutingModule {}
