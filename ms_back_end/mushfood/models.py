import os
import sys
from io import BytesIO
from uuid import uuid4

from PIL import Image
from django.contrib.auth.models import User
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.template.defaultfilters import slugify
from guardian.shortcuts import assign_perm

from mushfood.utils.image_utils import resize_and_crop


class Recipe(models.Model):
  """
  A recipe of something good to cook.
  """

  title = models.CharField(
    "title", max_length=50, blank=False, null=False, help_text="Title of the recipe"
  )
  slug = models.SlugField(
    "title slug",
    unique=True,
    editable=False,
    max_length=50,
    blank=False,
    null=False,
    help_text="Slug created from the title",
  )
  instructions = models.TextField(
    "description",
    blank=True,
    null=False,
    max_length=500,
    help_text="Instructions of the recipe",
  )
  author = models.ForeignKey(
    User,
    related_name="recipe",
    editable=False,
    on_delete=models.SET_NULL,
    null=True,
    help_text="Author of the recipe",
  )
  creation_date = models.DateTimeField(
    "creation date",
    auto_now_add=True,
    editable=False,
    null=False,
    help_text="Date of creation of the recipe",
  )
  update_date = models.DateTimeField(
    "update date",
    auto_now=True,
    editable=False,
    null=False,
    help_text="Date of last modification one of the recipe",
  )

  class Meta:
    verbose_name = "recipe"
    verbose_name_plural = "recipes"

  def __str__(self):
    return self.title

  def save(self, *args, **kwargs):
    """
    Override the save method to generate the creation date and the title slug.
    """
    # At the creation of the codex
    if not self.id:
      # Create a unique slug
      max_length = Recipe._meta.get_field("slug").max_length
      self.slug = slugify(self.title)[:max_length]
      original_slug = self.slug
      # Add an id to the slug to get uniqueness
      i = 0
      while Recipe.objects.filter(slug=self.slug).exists():
        i += 1
        # Truncate the original slug dynamically. Minus 1 for the hyphen.
        self.slug = "%s-%d" % (original_slug[: max_length - len(str(i)) - 1], i)
    # Save the codex
    super(Recipe, self).save(*args, **kwargs)
    # Set user permissions
    if getattr(self, 'author', None) is not None:
      assign_all_perm(self, self.author)


def hash_directory_path(instance, filename):
  # file will be uploaded to MEDIA_ROOT/recipe/hash.jpg
  return 'static/recipe/{0}.jpg'.format(uuid4().hex)


class RecipeImage(models.Model):
  """
  A picture of the recipe.
  """
  recipe = models.OneToOneField(
    Recipe,
    on_delete=models.CASCADE,
    null=False,
    editable=False,
    related_name="recipe_image",
  )

  image = models.ImageField(
    upload_to=hash_directory_path,
    null=False,
    editable=False,
  )

  creation_date = models.DateTimeField(
    "creation date",
    auto_now_add=True,
    editable=False,
    null=False,
    help_text="Date of creation of the picture",
  )

  class Meta:
    verbose_name = "recipe-image"
    verbose_name_plural = "recipe-images"

  def __str__(self):
    return "image for " + self.recipe.title

  def save(self, *args, **kwargs):
    """
    Override the save method to assign the permission
    """
    # # Opening the uploaded image
    # image = Image.open(self.image)
    # # Resize/modify the image
    # image = image.resize((100, 100))
    #
    # # after modifications, save it to the output
    # output = BytesIO()
    # image.save(output, format='JPEG', quality=100)
    # output.seek(0)
    #
    # # change the imagefield value to be the newley modifed image value
    # self.image = InMemoryUploadedFile(output, 'ImageField', "%s.jpg" % self.image.name.split('.')[0], 'image/jpeg',
    #                                 sys.getsizeof(output), None)

    # Resize and crop the image if needed
    self.image = resize_and_crop(self.image, (1024, 512), 'middle')

    # Save the codex
    super(RecipeImage, self).save(*args, **kwargs)
    # Set user permissions
    if getattr(self, 'author', None) is not None:
      assign_all_perm(self, self.recipe.author)

  def delete(self, using=None, keep_parents=False):
    """
    Override the delete method to delete the image file on disk
    """
    image_path = None
    if self.image:
      image_path = self.image.path
    super().delete(using, keep_parents)
    if os.path.isfile(image_path):
      os.remove(image_path)


def assign_all_perm(model_instance, user):
  model_name = model_instance._meta.model_name
  assign_perm('change_{}'.format(model_name), user, model_instance)
  assign_perm('delete_{}'.format(model_name), user, model_instance)
