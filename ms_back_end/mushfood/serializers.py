import os

from django.utils.translation import gettext
from rest_framework import serializers

from mushfood.models import (Recipe, RecipeImage, Ingredient, IngredientImage, MeasurementUnit, IngredientQuantity,
                             Category)


class CategorySerializer(serializers.ModelSerializer):

  class Meta:
    model = Category
    fields = ["id", "name"]

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
  category_set = CategorySerializer(many=True,required=False)

  class Meta:
    model = Recipe
    fields = ["id", "title", "slug", "portions", "instructions", "inspiration", "author", "creation_date", "update_date", "recipe_image",
              "logical_delete", "category_set"]
    read_only_fields = ("slug", "recipe_image")

  def validate_category_set(self, value):
    if value is not None and len(value) > 0:
      all_categories = list(Category.objects.all())
      result_categories_list = []
      # Retourner un tableau avec l'ensemble des Objets category qui correspondent aux id et aux nom des json présent dans le tableau value
      for category in value:
        # Permet d'avoir l'objet qui correspond exactement au json
        object_category = next((x for x in all_categories if x.name == category['name']), None)
        if object_category:
          result_categories_list.append(object_category)
        else:
          raise serializers.ValidationError(
            gettext(
              "The {category_name} category is not a valid one."
            ).format(category_name=category.name)
          )
      return result_categories_list
    else:
      return []

  def update(self, instance, validated_data):
    category_data = validated_data.pop('category_set')
    instance.category_set.clear()
    for category in category_data:
      instance.category_set.add(category)
    return super().update(instance, validated_data)

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
