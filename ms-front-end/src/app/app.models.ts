// List of models used by the application

export enum ModelState {
  Retrieved = 'RETRIEVED',
  Created = 'CREATED',
  Modified = 'MODIFIED',
  Deleted = 'DELETED',
  NotSaved = 'NOT_SAVED'
}

export abstract class Model {
  public static modelName: string;
  public static modelPlural: string;

  public static lookupField: string;
  public state: ModelState;
  public id: number;

}

export class BaseModel {
  public static lookupField = 'id';
  public state: ModelState;
  public id: number;
}

export class User extends BaseModel implements Model {
  static modelName = 'user';
  static modelPlural = 'user';
  static lookupField = 'userName';

  token: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  registrationDate: Date;
  dateJoined: Date;
}

export class UserPassword extends BaseModel implements Model {
  static modelName = 'password';
  static modelPlural = 'password';
  static lookupField = 'userName';

  userName: string;
  password: string;
  password2: string;
  oldPassword: string;
}

export class RecipeImage extends BaseModel implements Model {
  static modelName = 'recipe-images';
  static modelPlural = 'recipe-images';

  recipe: number;
  imageUrl: string;
  imageFile: File;
  creationDate: Date;
}


export class Recipe extends BaseModel implements Model {
  static modelName = 'recipes';
  static modelPlural = 'recipes';

  static lookupField = 'slug';
  title: string;
  slug: string;
  portions: number;
  instructions: string;
  inspiration: string;
  authorFullName: string;
  authorUserName: string;
  recipeImage: RecipeImage;
  categories: Category[];
  variantOf: number;
  variant: number[];
  creationDate: Date;
  updateDate: Date;
  logicalDelete: boolean;
}

export class Ingredient extends BaseModel implements Model {
  static modelName = 'ingredients';
  static modelPlural = 'ingredients';

  name: string;
  author: string;
  creationDate: Date;
  updateDate: Date;
}


export class IngredientImage extends BaseModel implements Model {
  static modelName = 'ingredient-images';
  static modelPlural = 'ingredient-images';

  ingredient: number;
  image: any;
  creationDate: Date;
  updateDate: Date;
}


export class MeasurementUnit extends BaseModel implements Model {
  static modelName = 'measurement-units';
  static modelPlural = 'measurement-units';

  name: string;
  shortName: string;
  isIgnorable: boolean;
  creationDate: Date;
  updateDate: Date;
}


export class IngredientQuantity extends BaseModel implements Model {
  static modelName = 'ingredient-quantities';
  static modelPlural = 'ingredient-quantities';

  tempId: number;
  quantity: number;
  measurementUnit: MeasurementUnit;
  ingredient: Ingredient;
  recipe: number;
  creationDate: Date;
  updateDate: Date;
}


export class Category extends BaseModel implements Model {
  static modelName = 'category';
  static modelPlural = 'categories';

  name: string;
}

export class Registration extends BaseModel implements Model {
  static modelName = 'registration';
  static modelPlural = 'registrations';

  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  reason: string;
  isRejected: boolean;
  logicalDelete: boolean;
  reCaptchaToken: string;
  creationDate: Date;
  updateDate: Date;
}
