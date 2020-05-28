import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoryService} from '../../category/services/category.service';
import {Category, Recipe} from '../../app.models';
import {RecipeService} from '../services/recipe.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-recipe-update-categories',
  templateUrl: './recipe-update-categories.component.html',
  styleUrls: ['./recipe-update-categories.component.scss']
})
export class RecipeUpdateCategoriesComponent implements OnInit, OnDestroy {

  recipe: Recipe;
  activeRecipeSubscription: Subscription;
  categoryList: Category[];

  constructor(
    private recipeService: RecipeService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.categoryList = this.categoryService.categoryList;
    this.activeRecipeSubscription = this.recipeService.activeRecipe$.subscribe(data => {
      this.recipe = data;
    });
  }

  ngOnDestroy(): void {
    this.activeRecipeSubscription.unsubscribe();
  }

  isRecipeOfThisCategory(categoryToCheck: Category): boolean {
    return this.recipe.categories.map(category => category.id).includes(categoryToCheck.id);
  }

  selectChip(selectedCategory: Category): void {
    if (this.isRecipeOfThisCategory(selectedCategory)){
      const index = this.recipe.categories.findIndex(category => category.id === selectedCategory.id)
      this.recipe.categories.splice(index,1);
    } else {
      this.recipe.categories.push(selectedCategory);
    }
    this.recipeService.updateActiveRecipeCategories(this.recipe.categories);
  }
}
