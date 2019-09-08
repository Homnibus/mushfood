import { NgModule } from '@angular/core';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import {SharedModule} from '../shared/shared.module';
import {RecipeRoutingModule} from './recipe-routing.module';
import { RecipeDetailsComponent } from './recipe-details/recipe-details.component';
import { RecipeAddComponent } from './recipe-add/recipe-add.component';
import { RecipeUpdateComponent } from './recipe-update/recipe-update.component';
import {MarkdownModule} from 'ngx-markdown';
import {IngredientModule} from '../ingredient/ingredient.module';


@NgModule({
  declarations: [RecipeListComponent, RecipeDetailsComponent, RecipeAddComponent, RecipeUpdateComponent],
  imports: [
    SharedModule,
    RecipeRoutingModule,
    MarkdownModule,
    IngredientModule,
  ]
})
export class RecipeModule { }
