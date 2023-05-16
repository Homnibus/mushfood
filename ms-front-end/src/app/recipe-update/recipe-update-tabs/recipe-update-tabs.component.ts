import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ModelState, Recipe } from "../../app.models";
import { TabLink } from "../../shared/web-page/web-page-tabs/web-page-tabs.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, Subscription } from "rxjs";
import { first, switchMap, tap } from "rxjs/operators";
import { RecipeService } from "../../recipe/services/recipe.service";
import { RecipeImageService } from "../../recipe-image/services/recipe-image.service";
import { IngredientQuantityService } from "../../ingredient/services/ingredient-quantity.service";
import { IngredientService } from "../../ingredient/services/ingredient.service";
import { IngredientQuantityMentionService } from "../../ingredient/services/ingredient-quantity-mention.service";
import { IngredientGroupService } from "src/app/ingredient/services/ingredient-group.service";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "app-recipe-update-tabs",
  templateUrl: "./recipe-update-tabs.component.html",
  styleUrls: ["./recipe-update-tabs.component.css"],
})
export class RecipeUpdateTabsComponent implements OnInit, OnDestroy {
  recipe: Recipe;
  tabLinkList: TabLink[];
  isSaving = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private recipeService: RecipeService,
    private recipeImageService: RecipeImageService,
    private ingredientQuantityService: IngredientQuantityService,
    private ingredientService: IngredientService,
    private ingredientQuantityMentionService: IngredientQuantityMentionService,
    private ingredientGroupService: IngredientGroupService
  ) {}

  ngOnInit() {
    this.recipeService
      .initActiveRecipe(this.activatedRoute.snapshot.paramMap.get("slug"))
      .pipe(first())
      .subscribe((recipe) => {
        if (
          this.authService.currentUser.userName &&
          recipe.authorUserName !== this.authService.currentUser.userName
        ) {
          this.router.navigateByUrl("/error/forbidden");
        }
        this.recipe = recipe;
        this.initTabLinkList(this.recipe);
      });
  }

  ngOnDestroy(): void {
    this.recipeImageService.resetModification();
    this.ingredientQuantityService.resetModification();
    this.ingredientGroupService.resetModification();
  }

  initTabLinkList(recipe: Recipe) {
    this.tabLinkList = [
      new TabLink(0, "Instruction", "/recipe/edit/" + recipe.slug),
      new TabLink(
        1,
        "Paramètres généraux",
        "/recipe/edit/" + recipe.slug + "/general-settings"
      ),
    ];
  }

  onClickUpdate(): void {
    if (!this.isSaving) {
      this.isSaving = true;
      this.saveAllTheThings().subscribe((recipe) => {
        const recipeDetailsUrl = this.router.createUrlTree([
          "/recipe/details",
          recipe.slug,
        ]);
        this.snackBar.open("Recipe Updated !", "Close", {
          duration: 2000,
          panelClass: ["green-snackbar"],
        });
        this.router
          .navigateByUrl(recipeDetailsUrl)
          .finally(() => (this.isSaving = false));
      });
    }
  }

  saveAllTheThings(): Observable<Recipe> {
    // Save the recipe Image
    return this.recipeImageService.saveRecipeImage().pipe(
      // Update the active recipe with the new RecipeImage
      tap((recipeImage) => {
        this.recipeService.addRecipeImageToUpdate(recipeImage);
      }),
      // Update the ingredient quantity
      switchMap(() =>
        this.ingredientQuantityService
          .saveIngredientQuantity(
            this.ingredientService.saveIngredient(
              this.ingredientQuantityService.getIngredientToCreate()
            ),
            this.ingredientQuantityService
              .saveIngredientQuantityToDelete()
              .pipe(
                switchMap((ingredientQuantityList) =>
                  this.ingredientGroupService.saveIngredientGroup()
                )
              )
          )
          .pipe(
            // Update the mentions for all the newly created ingredientQuantity
            tap((ingredientQuantityList) => {
              const createdIngredientQuantityList =
                ingredientQuantityList.filter(
                  (ingredientQuantity) =>
                    ingredientQuantity.state === ModelState.Created
                );
              for (const createdIngredientQuantity of createdIngredientQuantityList) {
                this.ingredientQuantityMentionService.updateMention(
                  createdIngredientQuantity,
                  this.recipe
                );
              }
            }),
            switchMap(() => this.recipeService.saveRecipe())
          )
      )
    );
  }
}
