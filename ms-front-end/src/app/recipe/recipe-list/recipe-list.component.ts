import {Component, OnDestroy, OnInit} from '@angular/core';
import {RecipeService} from '../services/recipe.service';
import {Subscription} from 'rxjs';
import {Recipe} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {ResizedEvent} from 'angular-resize-event';

enum Position {
  Middle,
  Left,
  Right,
  All,
  LastRowLeft
}

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy {

  recipeList: Recipe[];
  recipeListSubscription: Subscription;
  recipeListHexagon: Position[];
  positionEnum = Position;

  constructor(
    private recipeService: RecipeService,
    public authService: AuthService) {
  }

  ngOnInit() {
    this.recipeListSubscription = this.recipeService.filteredList(`logical_delete=false`)
      .subscribe(recipeList => {
        this.recipeList = recipeList;
        this.recipeListHexagon = this.recipeList.map(() => Position.Middle);
      });
  }

  ngOnDestroy() {
    this.recipeListSubscription.unsubscribe();
  }

  onResized(event: ResizedEvent) {
    const itemSize = 190;
    const maxItemNumber = Math.floor(event.newWidth / itemSize);
    this.recipeListHexagon = this.makeHoney(this.recipeListHexagon, maxItemNumber);
  }

  makeHoney(isFirstOfEvenLineList: number[], maxItemPerRow: number): number[] {
    const resultList = isFirstOfEvenLineList.map(value => Position.Middle);
    const listLength = isFirstOfEvenLineList.length;
    for (let i = 0; (maxItemPerRow - 1) * i + maxItemPerRow * i < listLength; i++) {
      resultList.splice((maxItemPerRow - 1) * i + maxItemPerRow * i, 1, Position.Left);
    }
    for (let i = 0; (maxItemPerRow - 1) * (i + 1) + maxItemPerRow * i - 1 < listLength; i++) {
      const position = (maxItemPerRow - 1) * (i + 1) + maxItemPerRow * i - 1;
      resultList.splice(position, 1, resultList[position] + 2);
    }
    const lastEvenRow = Math.floor(listLength / (maxItemPerRow * 2 - 1));
    let lastLeftItem;
    if (lastEvenRow * (maxItemPerRow * 2 - 1) + maxItemPerRow - 1 < listLength) {
      lastLeftItem = lastEvenRow * (maxItemPerRow * 2 - 1) + maxItemPerRow - 1;
      if (((listLength - lastLeftItem) % 2) !== maxItemPerRow % 2) {
        resultList.splice(lastLeftItem, 1, Position.LastRowLeft);
      }
    } else if (lastEvenRow * (maxItemPerRow * 2 - 1) < listLength) {
      lastLeftItem = lastEvenRow * (maxItemPerRow * 2 - 1);
      if (((listLength - lastLeftItem) % 2) === maxItemPerRow % 2) {
        resultList.splice(lastLeftItem, 1, Position.LastRowLeft);
      } else if (listLength - lastLeftItem !== maxItemPerRow - 1) {
        resultList.splice(lastLeftItem, 1, Position.Middle);
      }
    }
    return resultList;
  }

}
