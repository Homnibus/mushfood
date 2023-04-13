from mushfood.models import Recipe, IngredientQuantity

for recipe in Recipe.objects.all() :
  print("recipe : " + str(recipe))
  for index, ingredientQuantity in enumerate(IngredientQuantity.objects.filter(recipe__id=recipe.id)):
    print("ingredientQuantity : " + str(ingredientQuantity))
    print("ingredientQuantity creation date: " + str(ingredientQuantity.creation_date))
    print("ingredientQuantity rank and index: " + str(ingredientQuantity.rank) + " " + str(index))
    ingredientQuantity.rank = index+1
    ingredientQuantity.save()

