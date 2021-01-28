import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Position} from '../../shared/services/honey.service';

@Component({
  selector: 'app-recipe-hexagon',
  templateUrl: './recipe-hexagon.component.html',
  styleUrls: ['./recipe-hexagon.component.scss']
})
export class RecipeHexagonComponent {

  @Input()
  index: number;
  @Input()
  recipeRouterLink: any[] | string;
  @Input()
  backgroundImageLink: string;
  @Input()
  hexagonTitle: string;
  @Input()
  recipeListHexagon: Position[];
  @Input()
  variant: number[];
  @Input()
  flashOn = false;
  @Output()
  hexagonClick = new EventEmitter();
  positionEnum = Position;

  constructor() { }
}
