import {RecipeListComponent} from './recipe-list/recipe-list.component';
import {AuthGuard} from '../core/guard/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {RecipeDetailsComponent} from './recipe-details/recipe-details.component';
import {RecipeAddComponent} from './recipe-add/recipe-add.component';
import {RecipeUpdateComponent} from './recipe-update/recipe-update.component';

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
        canActivate: [AuthGuard],
        component: RecipeUpdateComponent
      },
      {
        path: 'details/:slug',
        component: RecipeDetailsComponent,
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
