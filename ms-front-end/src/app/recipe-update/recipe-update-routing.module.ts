import { AuthGuard } from "../core/guard/auth.guard";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RecipeUpdateTabsComponent } from "./recipe-update-tabs/recipe-update-tabs.component";
import { RecipeUpdateInstructionComponent } from "./recipe-update-instruction/recipe-update-instruction.component";
import { RecipeUpdateGeneralSettingsComponent } from "./recipe-update-general-settings/recipe-update-general-settings.component";

const routes: Routes = [
  {
    path: ":slug",
    component: RecipeUpdateTabsComponent,
    canActivateChild: [AuthGuard],
    data: { state: 2 },
    children: [
      {
        path: "",
        component: RecipeUpdateInstructionComponent,
        data: { state: 2.0 },
      },
      {
        path: "general-settings",
        component: RecipeUpdateGeneralSettingsComponent,
        data: { state: 2.1 },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipeUpdateRoutingModule {}
