from django.contrib import admin
from guardian.admin import GuardedModelAdmin

# Register your models here.
from mushfood.models import (IngredientQuantity, MeasurementUnit, IngredientImage, Ingredient, RecipeImage, Recipe,
                             Category, Registration)

admin.site.register(Recipe)
admin.site.register(RecipeImage)
admin.site.register(Ingredient)
admin.site.register(IngredientImage)
admin.site.register(MeasurementUnit)
admin.site.register(IngredientQuantity)
admin.site.register(Category)
admin.site.register(Registration)

