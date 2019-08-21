import {Model, ModelState, Recipe, RecipeImage} from './app.models';
import {environment} from '../environments/environment';

export abstract class ModelSerializer<T extends Model> {
  abstract fromJson(json: any, state: ModelState): T;

  abstract toCreateJson(instance: T): any;

  abstract toUpdateJson(instance: T): any;
}

export class RecipeSerializer implements ModelSerializer<Recipe> {
  fromJson(json: any, state: ModelState): Recipe {
    const recipe = new Recipe();
    recipe.id = parseInt(json.id, 10);
    recipe.title = json.title;
    recipe.slug = json.slug;
    recipe.instructions = json.instructions;
    recipe.author = json.author;
    recipe.creationDate = new Date(json.creation_date);
    recipe.updateDate = new Date(json.update_date);
    recipe.state = state;

    return recipe;
  }

  toJson(recipe: Recipe): any {
    return {
      title: recipe.title,
      instructions: recipe.instructions
    };
  }

  toCreateJson(recipe: Recipe): any {
    return this.toJson(recipe);
  }

  toUpdateJson(recipe: Recipe): any {
    return this.toJson(recipe);
  }
}


export class RecipeImageSerializer implements ModelSerializer<RecipeImage> {
  fromJson(json: any, state: ModelState): RecipeImage {
    const recipeImage = new RecipeImage();
    recipeImage.id = parseInt(json.id, 10);
    recipeImage.recipe = parseInt(json.recipe, 10);
    recipeImage.image =  environment.baseUrl + json.image;
    recipeImage.creationDate = new Date(json.creation_date);
    recipeImage.state = state;

    return recipeImage;
  }

  toJson(recipeImage: RecipeImage): any {
    return {
      recipe: recipeImage.recipe,
      image: recipeImage.image
    };
  }

  toCreateJson(recipeImage: RecipeImage): any {
    const formData = new FormData();
    formData.append('image', recipeImage.image);
    formData.append('recipe', recipeImage.recipe.toString());
    return formData;
  }

  toUpdateJson(recipeImage: RecipeImage): any {
    const formData = new FormData();
    formData.append('image', recipeImage.image);
    formData.append('recipe', recipeImage.recipe.toString());
    return formData;
  }
}
