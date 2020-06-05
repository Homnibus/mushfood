import {Injectable} from '@angular/core';
import {IngredientQuantity, ModelState, Recipe} from '../../app.models';

export class FeedItem {
  id: string;
  ingredientQuantityId: number;
  quantity: number;
  measurementUnit: string;
  ingredient: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngredientQuantityMentionService {

  constructor() {
  }

  ingredientQuantityToFeedId(ingredientQuantity: IngredientQuantity, quantity = parseFloat(ingredientQuantity.quantity.toFixed(2))): string {
    let feedId: string;
    feedId = `#${ingredientQuantity.ingredient.name}`;
    // tslint:disable-next-line:triple-equals
    if (!ingredientQuantity.measurementUnit.isIgnorable || quantity != 1) {
      feedId = feedId.concat(` (${quantity.toString()}`);
      if (!ingredientQuantity.measurementUnit.isIgnorable) {
        if (ingredientQuantity.measurementUnit.shortName !== null) {
          feedId = feedId.concat(` ${ingredientQuantity.measurementUnit.shortName}`);
        } else {
          feedId = feedId.concat(` ${ingredientQuantity.measurementUnit.name}`);
        }
      }
      feedId = feedId.concat(')');
    }
    return feedId;
  }

  ingredientQuantityToFeedItem(ingredientQuantity: IngredientQuantity): FeedItem {
    const resultFeedItem = new FeedItem();
    resultFeedItem.id = this.ingredientQuantityToFeedId(ingredientQuantity);
    resultFeedItem.ingredientQuantityId = ingredientQuantity.id ? ingredientQuantity.id : ingredientQuantity.tempId;
    resultFeedItem.quantity = ingredientQuantity.quantity;
    resultFeedItem.measurementUnit = ingredientQuantity.measurementUnit.name;
    resultFeedItem.ingredient = ingredientQuantity.ingredient.name;
    return resultFeedItem;
  }

  updateMention(ingredientQuantity: IngredientQuantity, recipe: Recipe, updatedPortions = recipe.portions): boolean {
    let result = false;
    const dom = document.createElement('div');
    dom.innerHTML = recipe.instructions;
    // Find the Mention element
    let currentMentionList: Element[];
    switch (ingredientQuantity.state) {
      case ModelState.Created:
        currentMentionList = Array.from(dom.querySelectorAll(`span.mention[data-ingredient="${ingredientQuantity.ingredient.name}"]`));
        break;
      case ModelState.NotSaved:
        currentMentionList = Array.from(dom.querySelectorAll(`span.mention[data-ingredient-quantity-id="${ingredientQuantity.tempId}"]`));
        break;
      default:
        currentMentionList = Array.from(dom.querySelectorAll(`span.mention[data-ingredient-quantity-id="${ingredientQuantity.id}"]`));
        break;
    }
    for (const currentMention of currentMentionList) {
      // Change the quantity attribute
      const newQuantity = parseFloat((ingredientQuantity.quantity * (updatedPortions / recipe.portions)).toFixed(2));
      currentMention.setAttribute('data-ingredient-quantity', newQuantity.toString());
      // Change the measurement unit attribute
      currentMention.setAttribute('data-measurement-unit', ingredientQuantity.measurementUnit.name);
      // Change the measurement unit attribute
      currentMention.setAttribute('data-ingredient', ingredientQuantity.ingredient.name);
      // Change the mention id
      const mentionId = ingredientQuantity.id ? ingredientQuantity.id : ingredientQuantity.tempId;
      currentMention.setAttribute('data-ingredient-quantity-id', mentionId.toString());
      currentMention.innerHTML = this.ingredientQuantityToFeedId(ingredientQuantity, newQuantity);
      recipe.instructions = dom.innerHTML;
      result = true;
    }
    return result;
  }

  updateAllMentionPortions(ingredientQuantityList: IngredientQuantity[], recipe: Recipe, updatedPortions= recipe.portions) {
    ingredientQuantityList.forEach(ingredientQuantity => this.updateMention(ingredientQuantity, recipe, updatedPortions));
  }
}
