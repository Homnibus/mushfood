import {Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RecipeService} from '../services/recipes.service';
import {Recipe} from '../../app.models';

@Component({
  selector: 'app-recipe-add',
  templateUrl: './recipe-add.component.html',
  styleUrls: ['./recipe-add.component.css']
})
export class RecipeAddComponent {

  recipeForm = this.fb.group({
    title: ['', Validators.required],
    instructions: ['']
  });

  constructor(private fb: FormBuilder, private router: Router, private recipeService: RecipeService) {
  }

  submit(): void {
    if (this.recipeForm.valid) {
      const newRecipe = new Recipe();
      newRecipe.title = this.recipeForm.get('title').value;
      newRecipe.instructions = this.recipeForm.get('instructions').value;
      this.recipeService.create(newRecipe).subscribe(
        recipe => {
          const recipeDetailsUrl = this.router.createUrlTree(['/recipe/details', recipe.slug]);
          this.router.navigateByUrl(recipeDetailsUrl);
        }
      );
    }
  }

}
