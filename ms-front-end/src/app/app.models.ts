// List of models used by the application

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


export class BaseModel {
  public static lookupField = 'id';
  public state: ModelState;
}

export class Recipe extends BaseModel implements Model {
  static modelName = 'recipes';
  static modelPlural = 'recipes';

  static lookupField = 'slug';
  id: number;
  title: string;
  slug: string;
  instructions: string;
  author: string;
  creationDate: Date;
  updateDate: Date;
}


export class RecipeImage extends BaseModel implements Model {
  static modelName = 'recipe-images';
  static modelPlural = 'recipe-images';

  id: number;
  recipe: number;
  image: any;
  creationDate: Date;
}

export class User {
  public name: string;
  public token: string;

  constructor(name: string, token: string) {
    this.token = token;
    this.name = name;
  }
}
