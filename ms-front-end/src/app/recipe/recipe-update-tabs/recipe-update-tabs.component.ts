import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Recipe} from '../../app.models';
import {TabLink} from '../../shared/web-page/web-page-tabs/web-page-tabs.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {forkJoin, Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {RecipeService} from '../services/recipe.service';
import {RecipeImageService} from '../../recipe-image/services/recipe-image.service';
import {IngredientQuantityService} from '../../ingredient/services/ingredient-quantity.service';
import {MeasurementUnitService} from '../../ingredient/services/measurement-unit.service';
import {IngredientService} from '../../ingredient/services/ingredient.service';

@Component({
  selector: 'app-recipe-update-tabs',
  templateUrl: './recipe-update-tabs.component.html',
  styleUrls: ['./recipe-update-tabs.component.css']
})
export class RecipeUpdateTabsComponent implements OnInit, OnDestroy {

  recipe: Recipe;
  activeRecipeSubscription: Subscription;
  tabLinkList: TabLink[];
  isSaving = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private recipeService: RecipeService,
              private recipeImageService: RecipeImageService,
              private ingredientQuantityService: IngredientQuantityService,
              private measurementUnitService: MeasurementUnitService,
              private ingredientService: IngredientService) {
  }

  ngOnInit() {
    this.activeRecipeSubscription = this.recipeService.activeRecipe$.subscribe(data => {
      this.recipe = data;
      this.initTabLinkList(this.recipe);
    });
  }

  ngOnDestroy(): void {
    this.activeRecipeSubscription.unsubscribe();
  }

  initTabLinkList(recipe: Recipe) {
    this.tabLinkList = [
      new TabLink(0, 'Instruction', '/recipe/edit/' + recipe.slug),
      new TabLink(1, 'Ingredient', '/recipe/edit/' + recipe.slug + '/ingredient'),
      new TabLink(2, 'Categories', '/recipe/edit/' + recipe.slug + '/categories'),
      new TabLink(3, 'General Settings', '/recipe/edit/' + recipe.slug + '/general-settings'),
    ];
  }

  onClickUpdate(): void {
    if (!this.isSaving) {
      this.isSaving = true;
      this.saveAllTheThings().subscribe(recipe => {
        const recipeDetailsUrl = this.router.createUrlTree(['/recipe/details', recipe.slug]);
        this.snackBar.open('Recipe Updated !', 'Close', {duration: 2000, panelClass: ['green-snackbar']});
        this.router.navigateByUrl(recipeDetailsUrl).finally(() => this.isSaving = false);
      });
    }
  }

  saveAllTheThings(): Observable<Recipe> {
    return forkJoin([
      this.recipeService.saveRecipe(),
      this.recipeImageService.saveRecipeImage(),
      this.ingredientQuantityService.saveIngredientQuantity(
        this.ingredientService.saveIngredient(
          this.recipe, this.ingredientQuantityService.toUpdateIngredientQuantity, this.ingredientQuantityService.toCreateIngredientQuantity
        )
      ),
    ]).pipe(
      map(data => data[0]),
    );
  }

}
