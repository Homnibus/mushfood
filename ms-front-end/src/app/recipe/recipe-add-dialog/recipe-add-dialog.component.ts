import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, Validators} from '@angular/forms';
import {Recipe} from '../../app.models';
import {Router} from '@angular/router';
import {RecipeService} from '../services/recipe.service';

@Component({
  selector: 'app-recipe-add-dialog',
  templateUrl: './recipe-add-dialog.component.html',
  styleUrls: ['./recipe-add-dialog.component.scss']
})
export class RecipeAddDialogComponent {

  recipeForm = this.fb.group({
    title: ['', Validators.required],
  });
  isCreating = false;

  constructor(
    public dialogRef: MatDialogRef<RecipeAddDialogComponent>,
    private router: Router,
    private recipeService: RecipeService,
    private fb: FormBuilder) {
  }

  createRecipe() {
    if (this.recipeForm.get('title').valid && !this.isCreating) {
      this.isCreating = true;
      const newRecipe = new Recipe();
      newRecipe.title = this.recipeForm.get('title').value;
      this.recipeService.create(newRecipe).subscribe(
        createdRecipe => {
          const recipeDetailsUrl = this.router.createUrlTree(['/recipe/edit', createdRecipe.slug]);
          this.router.navigateByUrl(recipeDetailsUrl)
            .then(r => this.dialogRef.close());
        }
      );
    } else {
      this.recipeForm.get('title').markAsTouched();
    }
  }
}
