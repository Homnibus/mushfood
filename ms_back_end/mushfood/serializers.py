import os

import requests
from django.conf import settings
from django.contrib.auth.models import User, Permission
from django.contrib.auth.password_validation import validate_password
from django.core.mail import EmailMultiAlternatives
from django.db.models import Q
from django.template.loader import render_to_string
from django.utils.translation import gettext
from rest_framework import serializers

from mushfood.models import (IngredientGroup, Recipe, RecipeImage, Ingredient, IngredientImage, MeasurementUnit, IngredientQuantity,
                             Category, Registration)


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
  variant_of = serializers.PrimaryKeyRelatedField(many=False, queryset=Recipe.objects.all(), required=False,
                                                  allow_null=True)
  variant = serializers.SerializerMethodField()

  class Meta:
    model = Recipe
    fields = ["id", "title", "slug", "portions", "instructions", "inspiration", "author", "author_full_name",
              "author_username", "creation_date", "update_date", "recipe_image", "logical_delete", "category_set",
              "variant_of", "variant"]
    read_only_fields = ("slug", "recipe_image")

  def get_variant(self, instance):
    return Recipe.objects.filter(id=instance.id) \
      .filter(Q(variant__logical_delete=False) & Q(variant__isnull=False)) \
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


class IngredientGroupSerializer(serializers.ModelSerializer):
  class Meta:
    model = IngredientGroup
    fields = "__all__"


class IngredientQuantitySerializer(serializers.ModelSerializer):
  measurement_unit = MeasurementUnitSerializer(many=False)
  ingredient = IngredientSerializer(many=False)
  ingredient_group = serializers.PrimaryKeyRelatedField(many=False, queryset=IngredientGroup.objects.all())

  class Meta:
    model = IngredientQuantity
    fields = "__all__"


class IngredientQuantityCreateSerializer(serializers.ModelSerializer):
  measurement_unit = serializers.PrimaryKeyRelatedField(many=False, queryset=MeasurementUnit.objects.all())
  ingredient = serializers.PrimaryKeyRelatedField(many=False, queryset=Ingredient.objects.all())
  ingredient_group = serializers.PrimaryKeyRelatedField(many=False, queryset=IngredientGroup.objects.all())

  class Meta:
    model = IngredientQuantity
    fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
  is_admin = serializers.SerializerMethodField()

  def get_is_admin(self, instance):
    return self.context['request'].user.is_superuser

  class Meta:
    model = User
    fields = ["first_name", "last_name", "date_joined", "email", "username", "is_admin"]
    read_only_fields = ["date_joined", "username"]


class UserCreateSerializer(serializers.ModelSerializer):
  registration_date = serializers.DateField(required=True, write_only=True)

  class Meta:
    model = User
    fields = ["first_name", "last_name", "email", "username", "registration_date"]

  def create(self, validated_data):
    registration_date = validated_data.pop("registration_date")
    password = User.objects.make_random_password(length=14)
    user = User(**validated_data)
    user.set_password(password)
    user.save()
    codesnames = ('add_ingredient', 'change_ingredient', 'view_ingredient', 'add_ingredientquantity',
                  'change_ingredientquantity', 'delete_ingredientquantity', 'view_ingredientquantity', 'add_recipe',
                  'change_recipe', 'view_recipe', 'add_recipeimage', 'change_recipeimage', 'view_recipeimage')
    perms = Permission.objects.filter(codename__in=codesnames)
    user.user_permissions.add(*perms)
    template_data = {'registration_date': registration_date, 'username': user.username, 'password': password}
    html_body = render_to_string("mushfood/registration_accepted.html", template_data)
    text_body = render_to_string("mushfood/registration_accepted.txt", template_data)
    msg = EmailMultiAlternatives('Inscription à Mushfood.fr', text_body, 'no-reply@mushfood.fr', [user.email])
    msg.attach_alternative(html_body, 'text/html')
    msg.send()
    return user


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


class RegistrationSerializer(serializers.ModelSerializer):
  class Meta:
    model = Registration
    fields = "__all__"

  def update(self, instance, validated_data):
    logical_delete_before_update = instance.logical_delete
    updated_registration = super().update(instance, validated_data)
    if (
        updated_registration.logical_delete and updated_registration.is_rejected and not logical_delete_before_update):
      template_data = {'registration_date': instance.creation_date}
      html_body = render_to_string("mushfood/registration_rejected.html", template_data)
      text_body = render_to_string("mushfood/registration_rejected.txt", template_data)
      msg = EmailMultiAlternatives('Inscription à Mushfood.fr', text_body, 'no-reply@mushfood.fr',
                                   [instance.email])
      msg.attach_alternative(html_body, 'text/html')
      msg.send()

    return updated_registration


class RegistrationCreateSerializer(serializers.ModelSerializer):
  re_captcha_token = serializers.CharField(required=True, allow_blank=False, write_only=True)

  def validate_re_captcha_token(self, value):
    response = requests.post('https://www.google.com/recaptcha/api/siteverify', data={
      'secret': settings.RE_CAPTCHA_V2_SECRET,
      'response': value
    })
    if response.status_code != 200:
      raise serializers.ValidationError({"re_captcha_token": "Error with reCaptcha validation request"})
    if not response.json()['success']:
      raise serializers.ValidationError({"re_captcha_token": "Are you human"})
    return value

  def validate_username(self, value):
    value = value.lower()
    if User.objects.filter(username=value) or Registration.objects.filter(username=value).exclude(
        logical_delete=True):
      raise serializers.ValidationError({"username": "Username already taken"})
    return value

  def create(self, validated_data):
    validated_data.pop('re_captcha_token', None)
    return super().create(validated_data)

  class Meta:
    model = Registration
    fields = ("username", "first_name", "last_name", "email", "reason", "re_captcha_token")
