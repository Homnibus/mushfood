import {Component, OnDestroy, OnInit} from '@angular/core';
import * as CustomEditor from 'ckeditor5-build-rescodex';
import {RecipeUpdateService} from '../services/recipe-update.service';
import {Recipe} from '../../app.models';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-recipe-update-instruction',
  templateUrl: './recipe-update-instruction.component.html',
  styleUrls: ['./recipe-update-instruction.component.css']
})
export class RecipeUpdateInstructionComponent implements OnInit, OnDestroy {

  public Editor = CustomEditor;
  recipe: Recipe;
  recipeForm: FormGroup;
  activeRecipeSubscription: Subscription;
  recipeInstructionFormOnChange: Subscription;

  constructor(private recipeUpdateService: RecipeUpdateService,
              private fb: FormBuilder,) {
  }

  ngOnInit(): void {
    this.activeRecipeSubscription = this.recipeUpdateService.activeRecipe$.subscribe(data => {
      this.recipe = data;
    });
    this.recipeUpdateService.activeRecipe$.pipe(first()).subscribe(data => {
      this.recipeForm = this.fb.group({
        instructions: [data.instructions],
      });
    });
    this.recipeInstructionFormOnChange = this.recipeForm.get('instructions').valueChanges
      .subscribe(instructions => this.recipeUpdateService.updateActiveRecipeInstruction(instructions));
  }

  ngOnDestroy(): void {
    this.activeRecipeSubscription.unsubscribe();
    this.recipeInstructionFormOnChange.unsubscribe();
  }

}
