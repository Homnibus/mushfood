import { Component, OnInit } from "@angular/core";
import { IngredientGroup, IngredientQuantity, Recipe } from "../../app.models";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { DomSanitizer } from "@angular/platform-browser";
import { IngredientQuantityMentionService } from "../../ingredient/services/ingredient-quantity-mention.service";
import { RecipeService } from "../services/recipe.service";
import { forkJoin } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { RecipeAddVariantDialogComponent } from "../recipe-add-variant-dialog/recipe-add-variant-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IngredientQuantityService } from "../../ingredient/services/ingredient-quantity.service";
import { MatDialog } from "@angular/material/dialog";
import { IngredientGroupService } from "src/app/ingredient/services/ingredient-group.service";

@Component({
  selector: "app-recipe-details",
  templateUrl: "./recipe-details.component.html",
  styleUrls: ["./recipe-details.component.scss"],
})
export class RecipeDetailsComponent implements OnInit {
  readonly modalWidth = "250px";

  recipe: Recipe;
  ingredientQuantityList: IngredientQuantity[];
  ingredientGroupList: IngredientGroup[];
  updatedPortions: number;
  variantList: Recipe[];
  variantOf: Recipe;
  data;

  constructor(
    public authService: AuthService,
    private ingredientQuantityMentionService: IngredientQuantityMentionService,
    private ingredientQuantityService: IngredientQuantityService,
    private ingredientGroupService: IngredientGroupService,
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.data = data;
      this.recipe = data.recipeIngredientQuantityList.recipe;
      this.ingredientQuantityList =
        data.recipeIngredientQuantityList.ingredientQuantityList;
      this.ingredientGroupList =
        data.recipeIngredientQuantityList.ingredientGroupList;
      this.updatedPortions = this.recipe.portions;
      if (this.recipe.logicalDelete) {
        this.router.navigateByUrl("/error/not-found");
      }
      this.getVariant();
      this.getVariantOf();
    });
  }

  ingredientQuantityOfIngredientGroup(
    ingredientGroup: IngredientGroup
  ): IngredientQuantity[] {
    return this.ingredientQuantityList.filter(
      (ingredientQuantity) =>
        ingredientQuantity.ingredientGroup === ingredientGroup.id
    );
  }

  addPortions(): void {
    this.updatedPortions++;
    this.ingredientQuantityMentionService.updateAllMentionPortions(
      this.ingredientQuantityList,
      this.recipe,
      this.updatedPortions
    );
  }

  removePortions(): void {
    if (this.updatedPortions > 1) {
      this.updatedPortions--;
      this.ingredientQuantityMentionService.updateAllMentionPortions(
        this.ingredientQuantityList,
        this.recipe,
        this.updatedPortions
      );
    }
  }

  quantityToString(quantity: number): string {
    return parseFloat(
      (quantity * (this.updatedPortions / this.recipe.portions)).toFixed(2)
    ).toString();
  }

  createVariant() {
    const dialogRef = this.dialog.open(RecipeAddVariantDialogComponent, {
      width: this.modalWidth,
    });
    dialogRef.afterClosed().subscribe((variantTitle) => {
      if (variantTitle) {
        // Create a recipe object that copy the ActiveRecipe
        // But don't copy the image
        this.recipeService
          .createVariant(variantTitle, this.recipe)
          .pipe(
            // Loop over the ingredient quantity to create them
            switchMap((recipe) =>
              this.ingredientQuantityService.createVariant(
                recipe,
                this.ingredientQuantityList
              )
            ),
            // Update the recipe mentions with the right ingredientQuantity id
            switchMap((resultTuple) => {
              const ingredientQuantityList = resultTuple[0];
              const recipe = resultTuple[1];
              this.ingredientQuantityMentionService.updateAllMentionPortions(
                ingredientQuantityList,
                recipe
              );
              return this.recipeService.update(recipe);
            })
          )
          .subscribe((recipe) => {
            const variantDetailsUrl = this.router.createUrlTree([
              "/recipe/details",
              recipe.slug,
            ]);
            this.snackBar.open("Variant Created !", "Close", {
              duration: 2000,
              panelClass: ["green-snackbar"],
            });
            this.router.navigateByUrl(variantDetailsUrl);
          });
      }
    });
  }

  private getVariant(): void {
    if (this.recipe.variant.length > 0) {
      forkJoin(
        this.recipe.variant.map((id) =>
          this.recipeService
            .filteredList(`id=${id}`)
            .pipe(
              map((resultRecipeList) =>
                resultRecipeList.length > 0 ? resultRecipeList[0] : undefined
              )
            )
        )
      ).subscribe((recipeList) => (this.variantList = recipeList));
    } else {
      this.variantList = [];
    }
  }

  private getVariantOf(): void {
    if (this.recipe.variantOf) {
      this.recipeService
        .filteredList(`id=${this.recipe.variantOf}`)
        .pipe(
          map((resultRecipeList) =>
            resultRecipeList.length > 0 ? resultRecipeList[0] : undefined
          )
        )
        .subscribe((recipe) => (this.variantOf = recipe));
    } else {
      this.variantOf = undefined;
    }
  }
}
