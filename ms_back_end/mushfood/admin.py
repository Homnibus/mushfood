from django.contrib import admin

# Register your models here.
from mushfood.models import IngredientQuantity, MeasurementUnit, IngredientImage, Ingredient, RecipeImage, Recipe

admin.site.register(Recipe)
admin.site.register(RecipeImage)
admin.site.register(Ingredient)
admin.site.register(IngredientImage)
admin.site.register(MeasurementUnit)
admin.site.register(IngredientQuantity)

