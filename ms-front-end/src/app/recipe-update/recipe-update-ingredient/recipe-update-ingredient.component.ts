import {Component, OnDestroy, OnInit} from '@angular/core';
import {Ingredient, IngredientQuantity, Recipe} from '../../app.models';
import {Subscription} from 'rxjs';
import {RecipeService} from '../../recipe/services/recipe.service';
import {IngredientQuantityService} from '../../ingredient/services/ingredient-quantity.service';
import {IngredientService} from '../../ingredient/services/ingredient.service';
import {MeasurementUnitService} from '../../ingredient/services/measurement-unit.service';
import {IngredientQuantityMentionService} from '../../ingredient/services/ingredient-quantity-mention.service';

@Component({
  selector: 'app-recipe-update-ingredient',
  templateUrl: './recipe-update-ingredient.component.html',
  styleUrls: ['./recipe-update-ingredient.component.scss']
})
export class RecipeUpdateIngredientComponent implements OnInit, OnDestroy {

  recipe: Recipe;
  activeRecipeSubscription: Subscription;
  ingredientQuantityList: IngredientQuantity[];
  activeIngredientQuantityListSubscription: Subscription;
  ingredientList: Ingredient[];
  activeIngredientListSubscription: Subscription;

  constructor(private recipeService: RecipeService,
              private ingredientService: IngredientService,
              private ingredientQuantityService: IngredientQuantityService,
              public measurementUnitService: MeasurementUnitService,
              private ingredientQuantityMentionService: IngredientQuantityMentionService,) {
  }

  ngOnInit(): void {
    this.activeRecipeSubscription = this.recipeService.activeRecipe$.subscribe(data => {
      this.recipe = data;
    });
    this.activeIngredientQuantityListSubscription = this.ingredientQuantityService.activeIngredientQuantityList$.subscribe(data => {
      this.ingredientQuantityList = data;
    });
    this.activeIngredientListSubscription = this.ingredientService.activeIngredientList$.subscribe(data => {
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
    const newIngredientQuantity = this.ingredientQuantityService.addIngredientQuantityToCreate(ingredientQuantity);
  }

  updateIngredientQuantity(toUpdateIngredientQuantity: IngredientQuantity): void {
    // Add the created ingredientQuantity to the list of the currents recipe ingredient.
    this.ingredientQuantityService.addIngredientQuantityToUpdate(toUpdateIngredientQuantity);
    const mentionUpdated = this.ingredientQuantityMentionService.updateMention(toUpdateIngredientQuantity, this.recipe);
    if (mentionUpdated) {
      this.recipe = this.recipeService.updateActiveRecipeInstruction(this.recipe.instructions);
    }
  }

  deleteIngredientQuantity(ingredientQuantity: IngredientQuantity): void {
    // Delete the ingredient from the recipe by calling the API.
    this.ingredientQuantityService.addIngredientQuantityToDelete(ingredientQuantity);
  }

}
