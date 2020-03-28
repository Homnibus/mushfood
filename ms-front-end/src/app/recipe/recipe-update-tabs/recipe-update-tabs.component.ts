import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RecipeUpdateService} from '../services/recipe-update.service';
import {Recipe} from '../../app.models';
import {TabLink} from '../../shared/web-page/web-page-tabs/web-page-tabs.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-recipe-update-tabs',
  templateUrl: './recipe-update-tabs.component.html',
  styleUrls: ['./recipe-update-tabs.component.css']
})
export class RecipeUpdateTabsComponent implements OnInit, OnDestroy {

  recipe: Recipe;
  tabLinkList: TabLink[];

  constructor(private recipeDetailsService: RecipeUpdateService,
              private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,) {
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.recipe = data.recipe;
      this.initTabLinkList(data.recipe);
    });
  }

  ngOnDestroy(): void {
    this.recipeDetailsService.removeActiveRecipe();
    this.recipeDetailsService.removeActiveRecipeImage();
    this.recipeDetailsService.removeActiveIngredientQuantityList();
  }

  initTabLinkList(recipe: Recipe) {
    this.tabLinkList = [
      new TabLink(0, 'Instruction', '/recipe/edit/' + recipe.slug),
      new TabLink(1, 'Ingredient', '/recipe/edit/' + recipe.slug + '/ingredient'),
      new TabLink(2, 'General Settings', '/recipe/edit/' + recipe.slug + '/general-settings'),
    ];
  }

  onClickUpdate(): void {
    this.recipeDetailsService.saveAllTheThings().subscribe(recipe => {
      const recipeDetailsUrl = this.router.createUrlTree(['/recipe/details', recipe.slug]);
      this.snackBar.open('Recipe Updated !', 'Close', {duration: 2000, panelClass: ['green-snackbar']});
      this.router.navigateByUrl(recipeDetailsUrl);
    });
  }
}
