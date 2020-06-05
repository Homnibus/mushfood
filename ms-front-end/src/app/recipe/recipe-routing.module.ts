import {RecipeListComponent} from './recipe-list/recipe-list.component';
import {AuthGuard} from '../core/guard/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {RecipeDetailsComponent} from './recipe-details/recipe-details.component';
import {RecipeUpdateInstructionComponent} from '../recipe-update/recipe-update-instruction/recipe-update-instruction.component';
import {RecipeUpdateTabsComponent} from '../recipe-update/recipe-update-tabs/recipe-update-tabs.component';
import {RecipeUpdateIngredientComponent} from '../recipe-update/recipe-update-ingredient/recipe-update-ingredient.component';
import {RecipeUpdateGeneralSettingsComponent} from '../recipe-update/recipe-update-general-settings/recipe-update-general-settings.component';
import {RecipeResolver} from './services/recipe.resolver';
import {RecipeImageResolver} from '../recipe-image/services/recipe-image.resolver';
import {IngredientQuantityResolver} from '../ingredient/services/ingredient-quantity.resolver';
import {MeasurementUnitResolver} from '../ingredient/services/measurement-unit.resolver';
import {IngredientResolver} from '../ingredient/services/ingredient.resolver';
import {RecipeIngredientQuantityResolver} from './services/recipe-ingredient-quantity.resolver';
import {CategoryResolver} from '../category/services/category.resolver';
import {RecipeUpdateCategoriesComponent} from '../recipe-update/recipe-update-categories/recipe-update-categories.component';

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
        path: 'edit',
        loadChildren: () => import('../recipe-update/recipe-update.module')
          .then(mod => mod.RecipeUpdateModule)
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
