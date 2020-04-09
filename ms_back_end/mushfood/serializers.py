import os

from rest_framework import serializers

from mushfood.models import Recipe, RecipeImage, Ingredient, IngredientImage, MeasurementUnit, IngredientQuantity


class RecipeImageSerializer(serializers.ModelSerializer):
  recipe = serializers.PrimaryKeyRelatedField(many=False, queryset=Recipe.objects.all())
  image = serializers.ImageField(max_length=None, allow_empty_file=False, use_url=True)

  class Meta:
    model = RecipeImage
    fields = "__all__"

  def update(self, instance, validated_data):
    old_image_path = None
    if instance.image:
      old_image_path = instance.image.path
    update_recipe_image = super().update(instance, validated_data)
    if os.path.isfile(old_image_path):
        os.remove(old_image_path)
    return update_recipe_image


class RecipeSerializer(serializers.ModelSerializer):
  author = serializers.HiddenField(default=serializers.CurrentUserDefault())
  recipe_image = RecipeImageSerializer(many=False, read_only=True)

  class Meta:
    model = Recipe
    fields = ["id", "title", "slug", "portions", "instructions", "inspiration", "author", "creation_date", "update_date", "recipe_image",
              "logical_delete"]
    read_only_fields = ("slug", "recipe_image")


class IngredientSerializer(serializers.ModelSerializer):
  author = serializers.HiddenField(default=serializers.CurrentUserDefault())

  class Meta:
    model = Ingredient
    fields = "__all__"


class IngredientImageSerializer(serializers.ModelSerializer):
  ingredient = serializers.PrimaryKeyRelatedField(many=False, queryset=Ingredient.objects.all())
  image = serializers.ImageField(max_length=None, allow_empty_file=False, use_url=False)

  class Meta:
    model = IngredientImage
    fields = "__all__"

  def update(self, instance, validated_data):
    old_image_path = None
    if instance.image:
      old_image_path = instance.image.path
    update_ingredient_image = super().update(instance, validated_data)
    if os.path.isfile(old_image_path):
        os.remove(old_image_path)
    return update_ingredient_image


class MeasurementUnitSerializer(serializers.ModelSerializer):

  class Meta:
    model = MeasurementUnit
    fields = "__all__"


class IngredientQuantitySerializer(serializers.ModelSerializer):
  measurement_unit = MeasurementUnitSerializer(many=False)
  ingredient = IngredientSerializer(many=False)
  recipe = serializers.PrimaryKeyRelatedField(many=False, queryset=Recipe.objects.all())

  class Meta:
    model = IngredientQuantity
    fields = "__all__"

class IngredientQuantityCreateSerializer(serializers.ModelSerializer):
  measurement_unit = serializers.PrimaryKeyRelatedField(many=False, queryset=MeasurementUnit.objects.all())
  ingredient = serializers.PrimaryKeyRelatedField(many=False, queryset=Ingredient.objects.all())
  recipe = serializers.PrimaryKeyRelatedField(many=False, queryset=Recipe.objects.all())

  class Meta:
    model = IngredientQuantity
    fields = "__all__"
