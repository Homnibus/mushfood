import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {RecipeUpdateService} from '../services/recipe-update.service';
import {Recipe, RecipeImage} from '../../app.models';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-recipe-update-general-settings',
  templateUrl: './recipe-update-general-settings.component.html',
  styleUrls: ['./recipe-update-general-settings.component.scss']
})
export class RecipeUpdateGeneralSettingsComponent implements OnInit, OnDestroy {

  recipe: Recipe;
  recipeImage: RecipeImage;
  activeRecipeSubscription: Subscription;
  activeRecipeImageSubscription: Subscription;
  recipeForm: FormGroup;

  constructor(public recipeUpdateService: RecipeUpdateService,
              private fb: FormBuilder,
              private router: Router,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,) {
  }

  ngOnInit(): void {
    this.activeRecipeSubscription = this.recipeUpdateService.activeRecipe$.subscribe(data => {
      this.recipe = data;
    });
    this.recipeUpdateService.activeRecipe$.pipe(first()).subscribe(data => {
      this.recipeForm = this.fb.group({
        title: [data.title],
        inspiration: [data.inspiration],
      });
    });
    this.activeRecipeImageSubscription = this.recipeUpdateService.activeRecipeImage$.subscribe(data => {
      this.recipeImage = data;
    });
    this.recipeForm.valueChanges.subscribe(
      data => this.recipeUpdateService.updateActiveRecipeGeneralSettings(data.title, data.inspiration)
    );

  }

  ngOnDestroy(): void {
    this.activeRecipeSubscription.unsubscribe();
    this.activeRecipeImageSubscription.unsubscribe();
  }

  deleteRecipe(): void {
    const dialogRef = this.dialog.open(RecipeUpdateDeleteDialogComponent, {
      width: '250px',
      data: this.recipe
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.recipeUpdateService.deleteRecipe().subscribe(() => {
          this.snackBar.open('Recipe Deleted !', 'Close', {duration: 2000,});
          this.router.navigateByUrl('/recipe');
        });
      }
    });


  }

}

@Component({
  selector: 'app-recipe-update-delete-dialog',
  templateUrl: 'recipe-update-delete-dialog.component.html',
  styleUrls: ['./recipe-update-delete-dialog.component.scss']
})
export class RecipeUpdateDeleteDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RecipeUpdateDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Recipe) {
  }

}
