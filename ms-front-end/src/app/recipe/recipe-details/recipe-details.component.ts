import { Component, OnDestroy, OnInit } from "@angular/core";
import { IngredientGroup, IngredientQuantity, Recipe } from "../../app.models";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { DomSanitizer } from "@angular/platform-browser";
import { IngredientQuantityMentionService } from "../../ingredient/services/ingredient-quantity-mention.service";
import { RecipeService } from "../services/recipe.service";
import { Subscription, forkJoin } from "rxjs";
import { first, map, switchMap } from "rxjs/operators";
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
export class RecipeDetailsComponent implements OnInit, OnDestroy {
  readonly modalWidth = "250px";

  recipe: Recipe;
  ingredientQuantityList: IngredientQuantity[];
  ingredientGroupList: IngredientGroup[];
  updatedPortions: number;
  variantList: Recipe[];
  variantOf: Recipe;
  activeRouteSubscription: Subscription;

  constructor(
    public authService: AuthService,
    private ingredientQuantityMentionService: IngredientQuantityMentionService,
    private ingredientQuantityService: IngredientQuantityService,
    private ingredientGroupService: IngredientGroupService,
    private recipeService: RecipeService,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.activeRouteSubscription = this.activatedRoute.paramMap
      .pipe(
        switchMap((paramMap) =>
          this.recipeService
            .initActiveRecipe(paramMap.get("slug"))
            .pipe(first())
        )
      )
      .subscribe((recipe) => {
        if (recipe.logicalDelete) {
          this.router.navigateByUrl("/error/not-found");
        }
        this.recipe = recipe;
        this.updatedPortions = this.recipe.portions;
        this.getVariant();
        this.getVariantOf();
        this.ingredientGroupService
          .initActiveIngredientGroupList(this.recipe)
          .pipe(first())
          .subscribe(
            (ingredientGroupList) =>
              (this.ingredientGroupList = ingredientGroupList)
          );
        this.ingredientQuantityService
          .initActiveIngredientQuantityList(this.recipe)
          .pipe(first())
          .subscribe(
            (ingredientQuantityList) =>
              (this.ingredientQuantityList = ingredientQuantityList)
          );
      });
  }

  ngOnDestroy(): void {
    this.activeRouteSubscription.unsubscribe();
    this.ingredientQuantityMentionService.updateAllMentionPortions(
      this.ingredientQuantityList,
      this.recipe,
      this.recipe.portions
    );
  }

  getVariant(): void {
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

  getVariantOf(): void {
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
            // Loop over the ingredient group to create them
            switchMap((createdRecipe) =>
              this.ingredientGroupService.createVariant(
                createdRecipe,
                this.ingredientGroupList,
                this.ingredientQuantityList
              )
            ),
            // Loop over the ingredient quantity to create them
            switchMap((resultTuple) => {
              const recipe = resultTuple[0];
              const ingredientQuantityList = resultTuple[1];
              return this.ingredientQuantityService.createVariant(
                recipe,
                ingredientQuantityList
              );
            }),
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
}
