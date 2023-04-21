import {
  Category,
  Ingredient,
  IngredientImage,
  IngredientQuantity,
  MeasurementUnit,
  Model,
  ModelState,
  Recipe,
  RecipeImage,
  UserPassword,
  User,
  Registration,
  IngredientGroup,
} from "./app.models";

export abstract class ModelSerializer<T extends Model> {
  abstract fromJson(json: any, state: ModelState): T;

  abstract toCreateJson(instance: T): any;

  abstract toUpdateJson(instance: T): any;
}

export class UserSerializer implements ModelSerializer<User> {
  fromJson(json: any, state: ModelState): User {
    const user = new User();
    user.userName = json.username;
    user.firstName = json.first_name;
    user.lastName = json.last_name;
    user.email = json.email;
    user.isAdmin = json.is_admin;
    user.dateJoined = new Date(json.date_joined);
    return user;
  }

  toJson(user: User): any {
    const formData = new FormData();
    formData.append("first_name", user.firstName);
    formData.append("last_name", user.lastName);
    formData.append("email", user.email);
    return formData;
  }

  toCreateJson(user: User): any {
    const formData = new FormData();
    formData.append("username", user.userName);
    formData.append("first_name", user.firstName);
    formData.append("last_name", user.lastName);
    formData.append("email", user.email);
    // adjust 0 before single digit date
    const date = ("0" + user.registrationDate.getDate()).slice(-2);
    // current month
    const month = ("0" + (user.registrationDate.getMonth() + 1)).slice(-2);
    // current year
    const year = user.registrationDate.getFullYear();
    formData.append("registration_date", year + "-" + month + "-" + date);
    return formData;
  }

  toUpdateJson(user: User): any {
    return this.toJson(user);
  }
}

export class UserPasswordSerializer implements ModelSerializer<UserPassword> {
  fromJson(json: any, state: ModelState): UserPassword {
    const userPassword = new UserPassword();
    userPassword.userName = json.username;
    userPassword.password = json.password;
    userPassword.password2 = json.password2;
    userPassword.oldPassword = json.old_password;
    return userPassword;
  }

  toJson(userPassword: UserPassword): any {
    const formData = new FormData();
    formData.append("password", userPassword.password);
    formData.append("password2", userPassword.password2);
    formData.append("old_password", userPassword.oldPassword);
    return formData;
  }

  toCreateJson(userPassword: UserPassword): any {
    return this.toJson(userPassword);
  }

  toUpdateJson(userPassword: UserPassword): any {
    return this.toJson(userPassword);
  }
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
    formData.append("image", recipeImage.imageFile);
    formData.append("recipe", recipeImage.recipe.toString());
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
    recipe.recipeImage = json.recipe_image
      ? recipeImageSerializer.fromJson(json.recipe_image, ModelState.Retrieved)
      : undefined;
    recipe.authorUserName = json.author_username;
    recipe.authorFullName = json.author_full_name;
    recipe.categories = json.category_set
      ? json.category_set.map((jsonCategory) =>
          categorySerializer.fromJson(jsonCategory, ModelState.Retrieved)
        )
      : [];
    recipe.variantOf = json.variant_of;
    recipe.variant = json.variant;
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
      category_set: recipe.categories.map((category) =>
        categorySerializer.toJson(category)
      ),
      variant_of: recipe.variantOf,
    };
  }

  toCreateJson(recipe: Recipe): any {
    const categorySerializer = new CategorySerializer();
    return {
      title: recipe.title,
      instructions: recipe.instructions,
      portions: recipe.portions,
      inspiration: recipe.inspiration,
      category_set: recipe.categories
        ? recipe.categories.map((category) =>
            categorySerializer.toJson(category)
          )
        : [],
      variant_of: recipe.variantOf,
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

export class IngredientImageSerializer
  implements ModelSerializer<IngredientImage>
{
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
      image: ingredientImage.image,
    };
  }

  toCreateJson(ingredientImage: IngredientImage): any {
    const formData = new FormData();
    formData.append("image", ingredientImage.image);
    formData.append("recipe", ingredientImage.ingredient.toString());
    return formData;
  }

  toUpdateJson(ingredientImage: IngredientImage): any {
    const formData = new FormData();
    formData.append("image", ingredientImage.image);
    formData.append("recipe", ingredientImage.ingredient.toString());
    return formData;
  }
}

export class MeasurementUnitSerializer
  implements ModelSerializer<MeasurementUnit>
{
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

export class IngredientGroupSerializer
  implements ModelSerializer<IngredientGroup>
{
  fromJson(json: any, state: ModelState): IngredientGroup {
    // const measurementUnitSerializer = new MeasurementUnitSerializer();
    // const ingredientSerializer = new IngredientSerializer();
    const ingredientGroup = new IngredientGroup();
    ingredientGroup.id = parseInt(json.id, 10);
    // ingredientGroup.Group = +json.Group;
    // ingredientGroup.measurementUnit = measurementUnitSerializer.fromJson(
    //   json.measurement_unit,
    //   ModelState.Retrieved
    // );
    // ingredientGroup.ingredient = ingredientSerializer.fromJson(
    //   json.ingredient,
    //   ModelState.Retrieved
    // );
    ingredientGroup.title = json.title;
    ingredientGroup.recipe = parseInt(json.recipe, 10);
    ingredientGroup.rank = parseInt(json.rank, 10);
    ingredientGroup.creationDate = new Date(json.creation_date);
    ingredientGroup.updateDate = new Date(json.update_date);
    ingredientGroup.state = state;

    return ingredientGroup;
  }

  toJson(ingredientGroup: IngredientGroup): any {
    return {
      title: ingredientGroup.title,
      recipe: ingredientGroup.recipe,
      rank: ingredientGroup.rank,
    };
  }

  toCreateJson(ingredientGroup: IngredientGroup): any {
    return this.toJson(ingredientGroup);
  }

  toUpdateJson(ingredientGroup: IngredientGroup): any {
    return this.toJson(ingredientGroup);
  }
}

export class IngredientQuantitySerializer
  implements ModelSerializer<IngredientQuantity>
{
  fromJson(json: any, state: ModelState): IngredientQuantity {
    const measurementUnitSerializer = new MeasurementUnitSerializer();
    const ingredientSerializer = new IngredientSerializer();
    const ingredientQuantity = new IngredientQuantity();
    ingredientQuantity.id = parseInt(json.id, 10);
    ingredientQuantity.quantity = +json.quantity;
    if (parseInt(json.measurement_unit, 10)) {
      ingredientQuantity.measurementUnit = parseInt(
        json.measurement_unit,
        10
      ) as any;
    } else {
      ingredientQuantity.measurementUnit = measurementUnitSerializer.fromJson(
        json.measurement_unit,
        ModelState.Retrieved
      );
    }
    if (parseInt(json.ingredient, 10)) {
      ingredientQuantity.ingredient = parseInt(json.ingredient, 10) as any;
    } else {
      ingredientQuantity.ingredient = ingredientSerializer.fromJson(
        json.ingredient,
        ModelState.Retrieved
      );
    }
    ingredientQuantity.ingredientGroup = parseInt(json.ingredient_group, 10);
    ingredientQuantity.rank = parseInt(json.rank, 10);
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
      ingredient_group: ingredientQuantity.ingredientGroup,
      rank: ingredientQuantity.rank,
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

export class RegistrationSerializer implements ModelSerializer<Registration> {
  fromJson(json: any, state: ModelState): Registration {
    const registration = new Registration();
    registration.id = parseInt(json.id, 10);
    registration.userName = json.username;
    registration.firstName = json.first_name;
    registration.lastName = json.last_name;
    registration.email = json.email;
    registration.reason = json.reason;
    registration.isRejected = json.is_rejected;
    registration.logicalDelete = json.logical_delete;
    registration.creationDate = new Date(json.creation_date);
    registration.updateDate = new Date(json.update_date);
    return registration;
  }

  toJson(registration: Registration): any {
    return {
      username: registration.userName,
      first_name: registration.firstName,
      last_name: registration.lastName,
      email: registration.email,
      reason: registration.reason,
      is_rejected: registration.isRejected,
      logical_delete: registration.logicalDelete,
    };
  }

  toCreateJson(registration: Registration): any {
    return {
      username: registration.userName,
      first_name: registration.firstName,
      last_name: registration.lastName,
      email: registration.email,
      reason: registration.reason,
      re_captcha_token: registration.reCaptchaToken,
    };
  }

  toUpdateJson(registration: Registration): any {
    return this.toJson(registration);
  }
}
