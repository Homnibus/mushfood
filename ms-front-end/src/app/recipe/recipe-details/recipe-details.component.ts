import {Component, OnInit} from '@angular/core';
import {IngredientQuantity, Recipe} from '../../app.models';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';
import {DomSanitizer} from '@angular/platform-browser';
import {IngredientQuantityMentionService} from '../../ingredient/services/ingredient-quantity-mention.service';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss']
})
export class RecipeDetailsComponent implements OnInit {

  recipe: Recipe;
  ingredientQuantityList: IngredientQuantity[];
  updatedPortions: number;

  constructor(public authService: AuthService,
              private ingredientQuantityMentionService: IngredientQuantityMentionService,
              private route: ActivatedRoute,
              private router: Router,
              public sanitizer: DomSanitizer,) {
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.recipe = data.recipeIngredientQuantityList.recipe;
      this.ingredientQuantityList = data.recipeIngredientQuantityList.ingredientQuantityList;
      this.updatedPortions = this.recipe.portions;
      if (this.recipe.logicalDelete) {
        this.router.navigateByUrl('/error/not-found');
      }
    });
  }


  addPortions(): void {
    this.updatedPortions++;
    this.ingredientQuantityMentionService.updateAllMentionPortions(this.ingredientQuantityList, this.recipe, this.updatedPortions);
  }

  removePortions(): void {
    if (this.updatedPortions > 1) {
      this.updatedPortions--;
      this.ingredientQuantityMentionService.updateAllMentionPortions(this.ingredientQuantityList, this.recipe, this.updatedPortions);
    }
  }

  quantityToString(quantity: number): string {
    return parseFloat((quantity * (this.updatedPortions / this.recipe.portions)).toFixed(2)).toString();
  }
}
