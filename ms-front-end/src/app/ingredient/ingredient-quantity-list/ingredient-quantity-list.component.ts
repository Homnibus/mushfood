import {Component, Input, OnInit} from '@angular/core';
import {IngredientQuantity, Recipe} from '../../app.models';
import {Observable} from 'rxjs';
import {IngredientQuantityService} from '../services/ingredient-quantity.service';

@Component({
  selector: 'app-ingredient-quantity-list',
  templateUrl: './ingredient-quantity-list.component.html',
  styleUrls: ['./ingredient-quantity-list.component.css']
})
export class IngredientQuantityListComponent implements OnInit {

  @Input() recipe: Recipe;
  ingredientQuantityList$: Observable<IngredientQuantity[]>;

  constructor(private ingredientQuantityService: IngredientQuantityService) {
  }

  ngOnInit() {
    this.ingredientQuantityList$ = this.ingredientQuantityService.filteredList(`recipe__id=${this.recipe.id}`);
  }

}
