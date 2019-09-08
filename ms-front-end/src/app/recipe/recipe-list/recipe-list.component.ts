import {Component, OnInit} from '@angular/core';
import {RecipeService} from '../services/recipes.service';
import {Observable} from 'rxjs';
import {Recipe} from '../../app.models';
import {RecipeImageService} from '../services/recipeImage.service';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {

  recipeList$: Observable<Recipe[]>;

  constructor(private recipeService: RecipeService, private authService: AuthService) {
  }

  ngOnInit() {
    this.recipeList$ = this.recipeService.filteredList(`logical_delete=false`);
  }

}
