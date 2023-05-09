import { Component, OnDestroy, OnInit } from "@angular/core";
import { CategoryService } from "../../category/services/category.service";
import { Category } from "../../app.models";
import { RecipeService } from "../../recipe/services/recipe.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-recipe-update-categories",
  templateUrl: "./recipe-update-categories.component.html",
  styleUrls: ["./recipe-update-categories.component.scss"],
})
export class RecipeUpdateCategoriesComponent implements OnInit, OnDestroy {
  recipeCategoryList: Category[];
  activeRecipeSubscription: Subscription;
  categoryList: Category[];

  constructor(
    private recipeService: RecipeService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // The active recipe is already initialized in the parent tab component
    // The form need to be reset if the active recipe changes
    this.activeRecipeSubscription = this.recipeService.activeRecipe$.subscribe(
      (activeRecipe) => {
        this.recipeCategoryList = activeRecipe.categories;
      }
    );

    this.categoryService
      .initCategoryList()
      .subscribe(
        (activeCategoryList) => (this.categoryList = activeCategoryList)
      );
  }

  ngOnDestroy(): void {
    this.activeRecipeSubscription.unsubscribe();
  }

  /**
   * Return if the given category is present in the updated recipe
   * @param categoryToCheck the category to find
   * @returns True if the given category is present in the updated recipe
   */
  isRecipeOfThisCategory(categoryToCheck: Category): boolean {
    return this.recipeCategoryList
      .map((category) => category.id)
      .includes(categoryToCheck.id);
  }

  /**
   * Add or remove a category and set it to be updated in the active recipe
   * @param selectedCategory the category to switch
   */
  selectChip(selectedCategory: Category): void {
    if (this.isRecipeOfThisCategory(selectedCategory)) {
      const index = this.recipeCategoryList.findIndex(
        (category) => category.id === selectedCategory.id
      );
      this.recipeCategoryList.splice(index, 1);
    } else {
      this.recipeCategoryList.push(selectedCategory);
    }
    this.recipeService.addRecipeCategoriesToUpdate(this.recipeCategoryList);
  }
}
