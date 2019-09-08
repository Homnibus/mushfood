import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Recipe} from '../../app.models';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {map, switchMap} from 'rxjs/operators';
import {RecipeService} from '../services/recipes.service';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss']
})
export class RecipeDetailsComponent implements OnInit {

  recipe$: Observable<Recipe>;

  constructor(private recipeService: RecipeService,
              private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.recipe$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.recipeService.get(params.get('slug'))),
      map(recipeList => {
        if (recipeList.length > 0) {
          if (recipeList[0].logicalDelete) {
            this.router.navigateByUrl('/error/not-found');
          }
          return recipeList[0];
        } else {
          return undefined;
        }
      })
    );
  }

}
