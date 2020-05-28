import {RecipeListComponent} from './recipe-list/recipe-list.component';
import {AuthGuard} from '../core/guard/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {RecipeDetailsComponent} from './recipe-details/recipe-details.component';
import {RecipeUpdateInstructionComponent} from './recipe-update-instruction/recipe-update-instruction.component';
import {RecipeUpdateTabsComponent} from './recipe-update-tabs/recipe-update-tabs.component';
import {RecipeUpdateIngredientComponent} from './recipe-update-ingredient/recipe-update-ingredient.component';
import {RecipeUpdateGeneralSettingsComponent} from './recipe-update-general-settings/recipe-update-general-settings.component';
import {RecipeResolver} from './services/recipe.resolver';
import {RecipeImageResolver} from '../recipe-image/services/recipe-image.resolver';
import {IngredientQuantityResolver} from '../ingredient/services/ingredient-quantity.resolver';
import {MeasurementUnitResolver} from '../ingredient/services/measurement-unit.resolver';
import {IngredientResolver} from '../ingredient/services/ingredient.resolver';
import {RecipeIngredientQuantityResolver} from './services/recipe-ingredient-quantity.resolver';
import {CategoryResolver} from '../category/services/category.resolver';
import {RecipeUpdateCategoriesComponent} from './recipe-update-categories/recipe-update-categories.component';

const routes: Routes = [
  {
    path: 'recipe',
    children: [
      {
        path: '',
        component: RecipeListComponent,
        resolve: {categoryList: CategoryResolver},
        data: {state: 1},
      },
      {
        path: 'edit/:slug',
        component: RecipeUpdateTabsComponent,
        resolve: {recipe: RecipeResolver},
        canActivateChild: [AuthGuard],
        data: {state: 2},
        children: [
          {
            path: '',
            component: RecipeUpdateInstructionComponent,
            data: {state: 2.0},
            resolve: {
              ingredientQuantityList: IngredientQuantityResolver,
            }
          },
          {
            path: 'ingredient',
            component: RecipeUpdateIngredientComponent,
            data: {state: 2.1},
            resolve: {
              ingredientQuantityList: IngredientQuantityResolver,
              measurementUnitList: MeasurementUnitResolver,
              ingredientList: IngredientResolver,
            },
          },
          {
            path: 'categories',
            component: RecipeUpdateCategoriesComponent,
            data: {state: 2.2},
            resolve: {categoryList: CategoryResolver},
          },
          {
            path: 'general-settings',
            component: RecipeUpdateGeneralSettingsComponent,
            data: {state: 2.3},
            resolve: {recipeImage: RecipeImageResolver},
          },
        ]
      },
      {
        path: 'details/:slug',
        component: RecipeDetailsComponent,
        data: {state: 3},
        resolve: {recipeIngredientQuantityList: RecipeIngredientQuantityResolver},
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
