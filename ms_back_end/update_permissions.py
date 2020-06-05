from mushfood.models import Recipe, IngredientQuantity, RecipeImage
from mushfood.utils.model_utils import assign_all_perm

for recipe in (u for u in Recipe.objects.all() if u.author and not u.author.is_anonymous):
  print("recipe : " + str(recipe))
  for ingredientQuantity in IngredientQuantity.objects.filter(recipe__id=recipe.id):
    print("ingredientQuantity : " + str(ingredientQuantity))
    assign_all_perm(ingredientQuantity, ingredientQuantity.recipe.author)
  for recipeImage in RecipeImage.objects.filter(recipe__id=recipe.id):
    print("recipeImage : " + str(recipeImage))
    assign_all_perm(recipeImage, recipeImage.recipe.author)
