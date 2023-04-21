import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { RecipeUpdateRoutingModule } from "./recipe-update-routing.module";
import { RecipeImageModule } from "../recipe-image/recipe-image.module";
import { IngredientModule } from "../ingredient/ingredient.module";
import { RecipeModule } from "../recipe/recipe.module";
import { RecipeUpdateInstructionComponent } from "./recipe-update-instruction/recipe-update-instruction.component";
import { RecipeUpdateIngredientComponent } from "./recipe-update-ingredient/recipe-update-ingredient.component";
import {
  RecipeUpdateDeleteDialogComponent,
  RecipeUpdateGeneralSettingsComponent,
} from "./recipe-update-general-settings/recipe-update-general-settings.component";
import { RecipeUpdateCategoriesComponent } from "./recipe-update-categories/recipe-update-categories.component";
import { CategoryModule } from "../category/category.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { RecipeAddGroupDialogComponent } from './recipe-add-group-dialog/recipe-add-group-dialog.component';

@NgModule({
  declarations: [
    RecipeUpdateInstructionComponent,
    RecipeUpdateIngredientComponent,
    RecipeUpdateGeneralSettingsComponent,
    RecipeUpdateDeleteDialogComponent,
    RecipeUpdateCategoriesComponent,
    RecipeAddGroupDialogComponent,
  ],
  imports: [
    SharedModule,
    RecipeUpdateRoutingModule,
    RecipeImageModule,
    IngredientModule,
    RecipeModule,
    CategoryModule,
    DragDropModule,
  ],
})
export class RecipeUpdateModule {}
