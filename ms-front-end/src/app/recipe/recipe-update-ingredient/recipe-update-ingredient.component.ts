import {Component, OnDestroy, OnInit} from '@angular/core';
import {Ingredient, IngredientQuantity, Recipe} from '../../app.models';
import {RecipeUpdateService} from '../services/recipe-update.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-recipe-update-ingredient',
  templateUrl: './recipe-update-ingredient.component.html',
  styleUrls: ['./recipe-update-ingredient.component.css']
})
export class RecipeUpdateIngredientComponent implements OnInit, OnDestroy {

  recipe: Recipe;
  activeRecipeSubscription: Subscription;
  ingredientQuantityList: IngredientQuantity[];
  activeIngredientQuantityListSubscription: Subscription;
  ingredientList: Ingredient[];
  activeIngredientListSubscription: Subscription;

  constructor(public recipeUpdateService: RecipeUpdateService,) {
  }

  ngOnInit(): void {
    this.activeRecipeSubscription = this.recipeUpdateService.activeRecipe$.subscribe(data => {
      this.recipe = data;
    });
    this.activeIngredientQuantityListSubscription = this.recipeUpdateService.activeIngredientQuantityList$.subscribe(data => {
      this.ingredientQuantityList = data;
    });
    this.activeIngredientListSubscription = this.recipeUpdateService.activeIngredientList$.subscribe(data => {
      this.ingredientList = data;
    });
  }

  ngOnDestroy(): void {
    this.activeRecipeSubscription.unsubscribe();
    this.activeIngredientQuantityListSubscription.unsubscribe();
    this.activeIngredientListSubscription.unsubscribe();
  }

  addIngredientQuantity(ingredientQuantity: IngredientQuantity): void {
    // Add the ingredient Quantity to the list of ingredient to create when saving the recipe
    this.recipeUpdateService.addIngredientQuantityToCreate(ingredientQuantity);
  }

  updateIngredientQuantity(toUpdateIngredientQuantity: IngredientQuantity): void {
    // Add the created ingredientQuantity to the list of the currents recipe ingredient.
    this.recipeUpdateService.addIngredientQuantityToUpdate(toUpdateIngredientQuantity);
  }

  deleteIngredientQuantity(ingredientQuantity: IngredientQuantity): void {
    // Delete the ingredient from the recipe by calling the API.
    this.recipeUpdateService.addIngredientQuantityToDelete(ingredientQuantity);
  }

}
