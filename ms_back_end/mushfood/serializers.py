import os

from rest_framework import serializers

from mushfood.models import Recipe, RecipeImage


class RecipeSerializer(serializers.ModelSerializer):
  author = serializers.HiddenField(default=serializers.CurrentUserDefault())

  class Meta:
    model = Recipe
    fields = "__all__"
    read_only_fields = ("slug",)


class RecipeImageSerializer(serializers.ModelSerializer):
  recipe = serializers.PrimaryKeyRelatedField(many=False, queryset=Recipe.objects.all())
  image = serializers.ImageField(max_length=None, allow_empty_file=False,use_url=False)

  class Meta:
    model = RecipeImage
    fields = "__all__"

  def update(self, instance, validated_data):
    old_image_path = None
    if instance.image:
      old_image_path = instance.image.path
    update_recipe_image = super(RecipeImageSerializer, self).update(instance, validated_data)
    if os.path.isfile(old_image_path):
        os.remove(old_image_path)
    return update_recipe_image
