import {
  Category,
  Ingredient,
  IngredientImage,
  IngredientQuantity,
  MeasurementUnit,
  Model,
  ModelState,
  Recipe,
  RecipeImage
} from './app.models';

export abstract class ModelSerializer<T extends Model> {
  abstract fromJson(json: any, state: ModelState): T;

  abstract toCreateJson(instance: T): any;

  abstract toUpdateJson(instance: T): any;
}



export class RecipeImageSerializer implements ModelSerializer<RecipeImage> {
  fromJson(json: any, state: ModelState): RecipeImage {
    const recipeImage = new RecipeImage();
    recipeImage.id = parseInt(json.id, 10);
    recipeImage.recipe = parseInt(json.recipe, 10);
    recipeImage.imageUrl = json.image;
    recipeImage.creationDate = new Date(json.creation_date);
    recipeImage.state = state;

    return recipeImage;
  }

  toJson(recipeImage: RecipeImage): any {
    const formData = new FormData();
    formData.append('image', recipeImage.imageFile);
    formData.append('recipe', recipeImage.recipe.toString());
    return formData;
  }

  toCreateJson(recipeImage: RecipeImage): any {
    return this.toJson(recipeImage);
  }

  toUpdateJson(recipeImage: RecipeImage): any {
    return this.toJson(recipeImage);
  }
}


export class RecipeSerializer implements ModelSerializer<Recipe> {
  fromJson(json: any, state: ModelState): Recipe {
    const recipeImageSerializer = new RecipeImageSerializer();
    const categorySerializer = new CategorySerializer();
    const recipe = new Recipe();
    recipe.id = parseInt(json.id, 10);
    recipe.title = json.title;
    recipe.slug = json.slug;
    recipe.portions = json.portions;
    recipe.instructions = json.instructions;
    recipe.inspiration = json.inspiration;
    recipe.recipeImage = json.recipe_image ? recipeImageSerializer.fromJson(json.recipe_image, ModelState.Retrieved) : undefined;
    recipe.author = json.author;
    recipe.categories = json.category_set ? json.category_set.map(jsonCategory => categorySerializer.fromJson(jsonCategory, ModelState.Retrieved)) : [];
    recipe.creationDate = new Date(json.creation_date);
    recipe.updateDate = new Date(json.update_date);
    recipe.logicalDelete = json.logical_delete;
    recipe.state = state;

    return recipe;
  }

  toJson(recipe: Recipe): any {
    const categorySerializer = new CategorySerializer();
    return {
      title: recipe.title,
      instructions: recipe.instructions,
      portions: recipe.portions,
      inspiration: recipe.inspiration,
      logical_delete: recipe.logicalDelete,
      category_set: recipe.categories.map(category => categorySerializer.toJson(category)),
    };
  }

  toCreateJson(recipe: Recipe): any {
    return {
      title: recipe.title,
    };
  }

  toUpdateJson(recipe: Recipe): any {
    return this.toJson(recipe);
  }
}


export class IngredientSerializer implements ModelSerializer<Ingredient> {
  fromJson(json: any, state: ModelState): Ingredient {
    const ingredient = new Ingredient();
    ingredient.id = parseInt(json.id, 10);
    ingredient.name = json.name;
    ingredient.author = json.author;
    ingredient.creationDate = new Date(json.creation_date);
    ingredient.updateDate = new Date(json.update_date);
    ingredient.state = state;

    return ingredient;
  }

  toJson(ingredient: Ingredient): any {
    return {
      name: ingredient.name,
    };
  }

  toCreateJson(ingredient: Ingredient): any {
    return this.toJson(ingredient);
  }

  toUpdateJson(ingredient: Ingredient): any {
    return this.toJson(ingredient);
  }
}


export class IngredientImageSerializer implements ModelSerializer<IngredientImage> {
  fromJson(json: any, state: ModelState): IngredientImage {
    const ingredientImage = new IngredientImage();
    ingredientImage.id = parseInt(json.id, 10);
    ingredientImage.ingredient = parseInt(json.ingredient, 10);
    ingredientImage.image = json.image;
    ingredientImage.creationDate = new Date(json.creation_date);
    ingredientImage.state = state;

    return ingredientImage;
  }

  toJson(ingredientImage: IngredientImage): any {
    return {
      recipe: ingredientImage.ingredient,
      image: ingredientImage.image
    };
  }

  toCreateJson(ingredientImage: IngredientImage): any {
    const formData = new FormData();
    formData.append('image', ingredientImage.image);
    formData.append('recipe', ingredientImage.ingredient.toString());
    return formData;
  }

  toUpdateJson(ingredientImage: IngredientImage): any {
    const formData = new FormData();
    formData.append('image', ingredientImage.image);
    formData.append('recipe', ingredientImage.ingredient.toString());
    return formData;
  }
}


export class MeasurementUnitSerializer implements ModelSerializer<MeasurementUnit> {
  fromJson(json: any, state: ModelState): MeasurementUnit {
    const measurementUnit = new MeasurementUnit();
    measurementUnit.id = parseInt(json.id, 10);
    measurementUnit.name = json.name;
    measurementUnit.shortName = json.short_name;
    measurementUnit.isIgnorable = json.is_ignorable;
    measurementUnit.creationDate = new Date(json.creation_date);
    measurementUnit.updateDate = new Date(json.update_date);
    measurementUnit.state = state;

    return measurementUnit;
  }

  toJson(measurementUnit: MeasurementUnit): any {
    return {
      title: measurementUnit.name,
    };
  }

  toCreateJson(measurementUnit: MeasurementUnit): any {
    return this.toJson(measurementUnit);
  }

  toUpdateJson(measurementUnit: MeasurementUnit): any {
    return this.toJson(measurementUnit);
  }
}

export class IngredientQuantitySerializer implements ModelSerializer<IngredientQuantity> {
  fromJson(json: any, state: ModelState): IngredientQuantity {
    const measurementUnitSerializer = new MeasurementUnitSerializer();
    const ingredientSerializer = new IngredientSerializer();
    const ingredientQuantity = new IngredientQuantity();

    ingredientQuantity.id = parseInt(json.id, 10);
    ingredientQuantity.quantity = +json.quantity;
    ingredientQuantity.measurementUnit = measurementUnitSerializer.fromJson(json.measurement_unit, ModelState.Retrieved);
    ingredientQuantity.ingredient = ingredientSerializer.fromJson(json.ingredient, ModelState.Retrieved);
    ingredientQuantity.recipe = parseInt(json.recipe, 10);
    ingredientQuantity.creationDate = new Date(json.creation_date);
    ingredientQuantity.updateDate = new Date(json.update_date);
    ingredientQuantity.state = state;

    return ingredientQuantity;
  }

  toJson(ingredientQuantity: IngredientQuantity): any {
    return {
      quantity: ingredientQuantity.quantity,
      measurement_unit: ingredientQuantity.measurementUnit.id,
      ingredient: ingredientQuantity.ingredient.id,
      recipe: ingredientQuantity.recipe,
    };
  }

  toCreateJson(ingredientQuantity: IngredientQuantity): any {
    return this.toJson(ingredientQuantity);
  }

  toUpdateJson(ingredientQuantity: IngredientQuantity): any {
    return this.toJson(ingredientQuantity);
  }
}

export class CategorySerializer implements ModelSerializer<Category> {
  fromJson(json: any, state: ModelState): Category {
    const category = new Category();
    category.id = parseInt(json.id, 10);
    category.name = json.name;
    return category;
  }

  toJson(category: Category): any {
    return {
      id: category.id,
      name: category.name,
    };
  }

  toCreateJson(category: Category): any {
    return this.toJson(category);
  }

  toUpdateJson(category: Category): any {
    return this.toJson(category);
  }
}
