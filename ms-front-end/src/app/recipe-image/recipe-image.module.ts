import {NgModule} from '@angular/core';
import {RecipeImageUpdateComponent} from './recipe-image-update/recipe-image-update.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [RecipeImageUpdateComponent],
  imports: [
    SharedModule,
  ],
  exports: [
    RecipeImageUpdateComponent,
  ],
})
export class RecipeImageModule {
}
