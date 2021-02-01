import os

from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from django.utils.translation import gettext
from rest_framework import serializers
from django.contrib.auth.models import User

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


class RecipeVariantSerializer(serializers.ModelSerializer):

  class Meta:
    model = Recipe
    fields = ["id", "slug", "title"]
    read_only_fields = ("id", "slug", "title")


class RecipeSerializer(serializers.ModelSerializer):
  author = serializers.HiddenField(default=serializers.CurrentUserDefault())
  author_full_name = serializers.SerializerMethodField()
  author_username = serializers.SerializerMethodField()
  recipe_image = RecipeImageSerializer(many=False, read_only=True)
  category_set = CategorySerializer(many=True, required=False)
  variant_of = serializers.PrimaryKeyRelatedField(many=False, queryset=Recipe.objects.all(), required=False, allow_null=True)
  variant = serializers.SerializerMethodField()

  class Meta:
    model = Recipe
    fields = ["id", "title", "slug", "portions", "instructions", "inspiration", "author", "author_full_name",
              "author_username", "creation_date", "update_date", "recipe_image", "logical_delete", "category_set",
              "variant_of", "variant"]
    read_only_fields = ("slug", "recipe_image")

  def get_variant(self, instance):
    return Recipe.objects.filter(id=instance.id)\
      .filter(Q(variant__logical_delete=False) & Q(variant__isnull=False))\
      .values_list('variant', flat=True)

  def get_author_full_name(self, instance):
    if (instance.author):
      return str(instance.author.first_name + " " + instance.author.last_name)
    else:
      return None

  def get_author_username(self, instance):
    if (instance.author):
      return str(instance.author.username)
    else:
      return None

  def validate_variant_of(self, value):
    if self.initial_data.get('id') and self.initial_data.get('id') == value.id:
      raise serializers.ValidationError(gettext("The recipe can't be a variant of itself."))
    return value

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

  def create(self, validated_data):
    category_data = validated_data.pop('category_set', [])
    newRecipe = Recipe.objects.create(**validated_data)
    for category in category_data:
      newRecipe.category_set.add(category)
    return newRecipe


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

class UserSerializer(serializers.ModelSerializer):

  is_admin = serializers.SerializerMethodField()

  def get_is_admin(self, instance):
    return self.context['request'].user.is_superuser

  class Meta:
    model = User
    fields = ["first_name","last_name","date_joined","email","username","is_admin"]
    read_only_fields = ["date_joined", "username"]

class ChangePasswordSerializer(serializers.ModelSerializer):
  password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
  password2 = serializers.CharField(write_only=True, required=True)
  old_password = serializers.CharField(write_only=True, required=True)

  class Meta:
    model = User
    fields = ('old_password', 'password', 'password2')

  def validate(self, attrs):
    if attrs['password'] != attrs['password2']:
      raise serializers.ValidationError({"password": "Password fields didn't match."})

    return attrs

  def validate_old_password(self, value):
    user = self.context['request'].user
    if not user.check_password(value):
      raise serializers.ValidationError({"old_password": "Old password is not correct"})
    return value

  def update(self, instance, validated_data):

    instance.set_password(validated_data['password'])
    instance.save()

    return instance