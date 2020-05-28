import {Injectable} from '@angular/core';
import {Position} from '../../recipe/recipe-list/recipe-list.component';

@Injectable({
  providedIn: 'root',
})
export class HoneyService  {

  constructor() {}

  makeHoney(isFirstOfEvenLineList: number[], itemWidth: number, ItemContainerWidth:number ): number[] {
    const maxItemPerRow = Math.floor(ItemContainerWidth / itemWidth);
    let resultList = isFirstOfEvenLineList;
    if (maxItemPerRow > 1) {
      resultList = isFirstOfEvenLineList.map(value => Position.Middle);
      const listLength = isFirstOfEvenLineList.length;
      for (let i = 0; (maxItemPerRow - 1) * i + maxItemPerRow * i < listLength; i++) {
        resultList[(maxItemPerRow - 1) * i + maxItemPerRow * i] = Position.Left;
      }
      for (let i = 0; (maxItemPerRow - 1) * (i + 1) + maxItemPerRow * i - 1 < listLength; i++) {
        const position = (maxItemPerRow - 1) * (i + 1) + maxItemPerRow * i - 1;
        resultList[position] = (resultList[position] + 2);
      }
      const lastEvenRow = Math.floor(listLength / (maxItemPerRow * 2 - 1));
      let lastLeftItem;
      if (lastEvenRow * (maxItemPerRow * 2 - 1) + maxItemPerRow - 1 < listLength) {
        lastLeftItem = lastEvenRow * (maxItemPerRow * 2 - 1) + maxItemPerRow - 1;
        if (((listLength - lastLeftItem) % 2) !== maxItemPerRow % 2) {
          resultList[lastLeftItem] = Position.LastRowLeft;
        }
      } else if (lastEvenRow * (maxItemPerRow * 2 - 1) < listLength) {
        lastLeftItem = lastEvenRow * (maxItemPerRow * 2 - 1);
        if (((listLength - lastLeftItem) % 2) === maxItemPerRow % 2) {
          resultList[lastLeftItem] = Position.LastRowLeft;
        } else if (listLength - lastLeftItem !== maxItemPerRow - 1) {
          resultList[lastLeftItem] = Position.Middle;
        }
      }
    } else {
      resultList = resultList.map((value, index) =>
        (index % 2) ? Position.Right : Position.Left
      );
    }
    return resultList;
  }

}
