import {NgModule} from '@angular/core';
import {RecipeListComponent} from './recipe-list/recipe-list.component';
import {SharedModule} from '../shared/shared.module';
import {RecipeRoutingModule} from './recipe-routing.module';
import {RecipeDetailsComponent} from './recipe-details/recipe-details.component';
import {MarkdownModule} from 'ngx-markdown';
import {IngredientModule} from '../ingredient/ingredient.module';
import {RecipeUpdateTabsComponent} from './recipe-update-tabs/recipe-update-tabs.component';
import {RecipeUpdateInstructionComponent} from './recipe-update-instruction/recipe-update-instruction.component';
import {RecipeUpdateIngredientComponent} from './recipe-update-ingredient/recipe-update-ingredient.component';
import {
  RecipeUpdateDeleteDialogComponent,
  RecipeUpdateGeneralSettingsComponent
} from './recipe-update-general-settings/recipe-update-general-settings.component';
import {RecipeImageModule} from '../recipe-image/recipe-image.module';
import {AngularResizedEventModule} from 'angular-resize-event';
import {RecipeAddDialogComponent} from './recipe-add-dialog/recipe-add-dialog.component';


@NgModule({
  declarations: [
    RecipeListComponent,
    RecipeDetailsComponent,
    RecipeAddDialogComponent,
    RecipeUpdateTabsComponent,
    RecipeUpdateInstructionComponent,
    RecipeUpdateIngredientComponent,
    RecipeUpdateGeneralSettingsComponent,
    RecipeUpdateDeleteDialogComponent,
    RecipeAddDialogComponent],
  imports: [
    AngularResizedEventModule,
    SharedModule,
    RecipeRoutingModule,
    RecipeImageModule,
    MarkdownModule,
    IngredientModule,
  ]
})
export class RecipeModule { }
