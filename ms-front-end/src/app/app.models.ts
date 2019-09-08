// List of models used by the application

import {IngredientSerializer} from './app.serializers';

export enum ModelState {
  Retrieved = 'RETRIEVED',
  Created = 'CREATED',
  Modified = 'MODIFIED',
  Deleted = 'DELETED',
}

export abstract class Model {
  public static modelName: string;
  public static modelPlural: string;

  public static lookupField: string;
  public state: ModelState;
}

export class User {
  public name: string;
  public token: string;

  constructor(name: string, token: string) {
    this.token = token;
    this.name = name;
  }
}

export class BaseModel {
  public static lookupField = 'id';
  public state: ModelState;
}


export class RecipeImage extends BaseModel implements Model {
  static modelName = 'recipe-images';
  static modelPlural = 'recipe-images';

  id: number;
  recipe: number;
  image: any;
  creationDate: Date;
}


export class Recipe extends BaseModel implements Model {
  static modelName = 'recipes';
  static modelPlural = 'recipes';

  static lookupField = 'slug';
  id: number;
  title: string;
  slug: string;
  instructions: string;
  inspiration: string;
  author: string;
  recipeImage: RecipeImage;
  creationDate: Date;
  updateDate: Date;
  logicalDelete: boolean;
}

export class Ingredient extends BaseModel implements Model {
  static modelName = 'ingredients';
  static modelPlural = 'ingredients';

  id: number;
  name: string;
  author: string;
  creationDate: Date;
  updateDate: Date;
}


export class IngredientImage extends BaseModel implements Model {
  static modelName = 'ingredient-images';
  static modelPlural = 'ingredient-images';

  id: number;
  ingredient: number;
  image: any;
  creationDate: Date;
  updateDate: Date;
}


export class MeasurementUnit extends BaseModel implements Model {
  static modelName = 'measurement-units';
  static modelPlural = 'measurement-units';

  id: number;
  name: string;
  creationDate: Date;
  updateDate: Date;
}


export class IngredientQuantity extends BaseModel implements Model {
  static modelName = 'ingredient-quantities';
  static modelPlural = 'ingredient-quantities';

  id: number;
  quantity: number;
  measurementUnit: MeasurementUnit;
  ingredient: Ingredient;
  recipe: number;
  creationDate: Date;
  updateDate: Date;
}

