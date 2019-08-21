import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Recipe, RecipeImage} from '../../app.models';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {map, switchMap} from 'rxjs/operators';
import {RecipeService} from '../services/recipes.service';
import {RecipeImageService} from '../services/recipeImage.service';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnInit {

  recipe$: Observable<Recipe>;
  recipeImageList$: Observable<RecipeImage[]>;

  constructor(private recipeService: RecipeService, private recipeImageService: RecipeImageService, private route: ActivatedRoute) {
  }

  ngOnInit() {

    this.recipe$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.recipeService.get(params.get('slug'))),
      map(recipeList => {
        if (recipeList.length > 0) {
          return recipeList[0];
        } else {
          return undefined;
        }
      })
    );

    this.recipeImageList$ = this.recipe$.pipe(
      switchMap(
        (recipe: Recipe) => {
          return this.recipeImageService.filteredList(`recipe__id=${recipe.id}`);
        }
      )
    );

  }

}
