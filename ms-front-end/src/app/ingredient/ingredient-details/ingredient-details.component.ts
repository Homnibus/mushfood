import {Component, Input, OnInit} from '@angular/core';
import {Ingredient, Recipe} from '../../app.models';
import {RecipeService} from '../../recipe/services/recipes.service';
import {IngredientService} from '../services/ingredient.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-ingredient-details',
  templateUrl: './ingredient-details.component.html',
  styleUrls: ['./ingredient-details.component.css']
})
export class IngredientDetailsComponent implements OnInit {

  @Input() recipe: Recipe;
  ingredientList$: Observable<Ingredient[]>;

  constructor(private ingredientService: IngredientService, ) { }

  ngOnInit() {
  }

}
