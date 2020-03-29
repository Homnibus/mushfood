import {RecipeListComponent} from './recipe-list/recipe-list.component';
import {AuthGuard} from '../core/guard/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {RecipeDetailsComponent} from './recipe-details/recipe-details.component';
import {RecipeAddComponent} from './recipe-add/recipe-add.component';
import {RecipeUpdateInstructionComponent} from './recipe-update-instruction/recipe-update-instruction.component';
import {RecipeUpdateTabsComponent} from './recipe-update-tabs/recipe-update-tabs.component';
import {RecipeUpdateIngredientComponent} from './recipe-update-ingredient/recipe-update-ingredient.component';
import {RecipeUpdateGeneralSettingsComponent} from './recipe-update-general-settings/recipe-update-general-settings.component';
import {RecipeResolver} from './services/recipe.resolver';
import {RecipeImageResolver} from '../recipe-image/services/recipe-image.resolver';
import {IngredientQuantityUpdateResolver} from '../ingredient/services/ingredient-quantity-update.resolver';
import {MeasurementUnitResolver} from '../ingredient/services/measurement-unit.resolver';
import {IngredientResolver} from '../ingredient/services/ingredient.resolver';

const routes: Routes = [
  {
    path: 'recipe',
    children: [
      {
        path: '',
        component: RecipeListComponent,
      },
      {
        path: 'add',
        canActivate: [AuthGuard],
        component: RecipeAddComponent
      },
      {
        path: 'edit/:slug',
        component: RecipeUpdateTabsComponent,
        resolve: {recipe: RecipeResolver},
        canActivateChild: [AuthGuard],
        children: [
          {
            path: '',
            component: RecipeUpdateInstructionComponent,
          },
          {
            path: 'ingredient',
            component: RecipeUpdateIngredientComponent,
            resolve: {
              ingredientQuantityList: IngredientQuantityUpdateResolver,
              measurementUnitList: MeasurementUnitResolver,
              ingredientList: IngredientResolver,
            },
          },
          {
            path: 'general-settings',
            component: RecipeUpdateGeneralSettingsComponent,
            resolve: {recipeImage: RecipeImageResolver},
          },
        ]
      },
      {
        path: 'details/:slug',
        component: RecipeDetailsComponent,
        resolve: {recipe: RecipeResolver},
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecipeRoutingModule {
}
