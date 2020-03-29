import {Component, OnInit} from '@angular/core';
import {IngredientQuantity, Recipe} from '../../app.models';
import {ActivatedRoute, Router} from '@angular/router';
import {RecipeService} from '../services/recipe.service';
import {AuthService} from '../../core/services/auth.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss']
})
export class RecipeDetailsComponent implements OnInit {

  recipe: Recipe;
  ingredientQuantityList: IngredientQuantity[];

  constructor(private recipeService: RecipeService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              public sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.recipe = data.recipe;
      if (this.recipe.logicalDelete) {
        this.router.navigateByUrl('/error/not-found');
      }
    });
  }

}
