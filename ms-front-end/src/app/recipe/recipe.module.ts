import {NgModule} from '@angular/core';
import {RecipeListComponent} from './recipe-list/recipe-list.component';
import {SharedModule} from '../shared/shared.module';
import {RecipeRoutingModule} from './recipe-routing.module';
import {RecipeDetailsComponent} from './recipe-details/recipe-details.component';
import {IngredientModule} from '../ingredient/ingredient.module';
import {RecipeUpdateTabsComponent} from '../recipe-update/recipe-update-tabs/recipe-update-tabs.component';
import {RecipeImageModule} from '../recipe-image/recipe-image.module';
import {AngularResizedEventModule} from 'angular-resize-event';
import {RecipeAddDialogComponent} from './recipe-add-dialog/recipe-add-dialog.component';
import { RecipeHexagonComponent } from './recipe-hexagon/recipe-hexagon.component';
import { RecipeAddVariantDialogComponent } from './recipe-add-variant-dialog/recipe-add-variant-dialog.component';
import {CategoryModule} from '../category/category.module';


@NgModule({
  declarations: [
    RecipeListComponent,
    RecipeDetailsComponent,
    RecipeAddDialogComponent,
    RecipeUpdateTabsComponent,
    RecipeHexagonComponent,
    RecipeAddVariantDialogComponent],
  imports: [
    AngularResizedEventModule,
    SharedModule,
    RecipeRoutingModule,
    RecipeImageModule,
    IngredientModule,
    CategoryModule,
  ]
})
export class RecipeModule { }
