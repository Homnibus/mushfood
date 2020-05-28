import {Component, Input} from '@angular/core';
import {Position} from '../recipe-list/recipe-list.component';

@Component({
  selector: 'app-recipe-hexagon',
  templateUrl: './recipe-hexagon.component.html',
  styleUrls: ['./recipe-hexagon.component.scss']
})
export class RecipeHexagonComponent {

  @Input()
  index: number;
  @Input()
  routerLink: any[] | string;
  @Input()
  backgroundImageLink: string;
  @Input()
  hexagonTitle: string;
  @Input()
  recipeListHexagon: Position[];
  positionEnum = Position;

  constructor() { }
}
