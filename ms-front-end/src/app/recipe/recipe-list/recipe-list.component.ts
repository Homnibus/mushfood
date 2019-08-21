import {Component, OnInit} from '@angular/core';
import {RecipeService} from '../services/recipes.service';
import {Observable} from 'rxjs';
import {Recipe} from '../../app.models';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {

  recipeList$: Observable<Recipe[]>;

  constructor(private recipeService: RecipeService,) {
  }

  ngOnInit() {
    this.recipeList$ = this.recipeService.list();
  }

}
