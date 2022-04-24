import os
from uuid import uuid4

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db import models
from django.template.defaultfilters import slugify

from mushfood.utils.image_utils import resize_and_crop
from mushfood.utils.model_utils import assign_all_perm


class Recipe(models.Model):
  """
  A recipe of something good to cook.
  """

  id = models.AutoField(primary_key=True)
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
  portions = models.PositiveIntegerField(
    "portions",
    default=1,
    null=False,
    blank=False,
    help_text="Number of portion this recipe provide",
  )
  instructions = models.TextField(
    "instructions",
    blank=True,
    null=False,
    help_text="Instructions of the recipe",
  )
  inspiration = models.TextField(
    "inspiration",
    blank=True,
    null=True,
    help_text="Inspiration of the recipe",
  )
  author = models.ForeignKey(
    User,
    related_name="recipe",
    editable=False,
    on_delete=models.SET_NULL,
    null=True,
    help_text="Author of the recipe",
  )
  variant_of = models.ForeignKey(
    'self',
    on_delete=models.SET_NULL,
    null=True,
    related_name="variant",
    help_text="Variant of the recipe",
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
  logical_delete = models.BooleanField(
    "logical delete",
    null=False,
    default=False,
    help_text="True if the recipe is deleted.",
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
    super().save(*args, **kwargs)
    # Set user permissions
    if getattr(self, 'author', None) is not None:
      assign_all_perm(self, self.author)


class RecipeImage(models.Model):
  """
  A picture of the recipe.
  """

  id = models.AutoField(primary_key=True)
  recipe = models.OneToOneField(
    Recipe,
    on_delete=models.CASCADE,
    null=False,
    editable=False,
    related_name="recipe_image",
  )
  image = models.ImageField(
    upload_to='recipe',
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
  update_date = models.DateTimeField(
    "update date",
    auto_now=True,
    editable=False,
    null=False,
    help_text="Date of last modification one of the picture",
  )

  class Meta:
    verbose_name = "recipe-image"
    verbose_name_plural = "recipe-images"

  save_directory = "recipe"

  def __str__(self):
    return "image for " + self.recipe.title

  def save(self, *args, **kwargs):
    """
    Override the save method to assign the permission and
     resize the image
    """
    # Resize and crop the image if needed
    self.image = resize_and_crop(self.image, (350, 350), 'middle')
    self.image.name = '{0}.webp'.format(uuid4().hex)

    # Save the image
    super(RecipeImage, self).save(*args, **kwargs)
    # Set user permissions
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


class Ingredient(models.Model):
  """
  Some food used in a Recipe
  """

  id = models.AutoField(primary_key=True)
  name = models.CharField(
    "name", max_length=50, blank=False, null=False, help_text="Name of the ingredient"
  )
  author = models.ForeignKey(
    User,
    related_name="ingredient",
    editable=False,
    on_delete=models.SET_NULL,
    null=True,
    help_text="Creator of the ingredient",
  )
  creation_date = models.DateTimeField(
    "creation date",
    auto_now_add=True,
    editable=False,
    null=False,
    help_text="Date of creation of the ingredient",
  )
  update_date = models.DateTimeField(
    "update date",
    auto_now=True,
    editable=False,
    null=False,
    help_text="Date of last modification one of the ingredient",
  )

  class Meta:
    verbose_name = "ingredient"
    verbose_name_plural = "ingredients"

  def __str__(self):
    return self.name


class IngredientImage(models.Model):
  """
  A picture of the ingredient.
  """

  id = models.AutoField(primary_key=True)
  ingredient = models.OneToOneField(
    Ingredient,
    on_delete=models.CASCADE,
    null=False,
    editable=False,
    related_name="ingredient_image",
  )

  image = models.ImageField(
    upload_to='ingredient',
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
  update_date = models.DateTimeField(
    "update date",
    auto_now=True,
    editable=False,
    null=False,
    help_text="Date of last modification one of the picture",
  )

  class Meta:
    verbose_name = "ingredient-image"
    verbose_name_plural = "ingredient-images"

  save_directory = "ingredient"

  def __str__(self):
    return "image for " + self.ingredient.name

  def save(self, *args, **kwargs):
    """
    Override the save method to assign the permission and resize the image
    """
    # Resize and crop the image if needed
    self.image = resize_and_crop(self.image, (128, 128), 'middle')
    self.image.name = '{0}.jpg'.format(uuid4().hex)

    # Save the image
    super().save(*args, **kwargs)

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


class MeasurementUnit(models.Model):
  """
  Measurement unit of a Ingredient
  """

  id = models.AutoField(primary_key=True)
  name = models.CharField(
    "name", max_length=50, blank=False, null=False, help_text="Name of the measurement unit"
  )
  short_name = models.CharField(
    "short name", max_length=50, blank=True, null=True, help_text="Short name of the measurement unit"
  )
  is_ignorable = models.BooleanField(
    "is ignorable", default=False, null=False, help_text=" Can the measurement unit be ignored"
  )
  creation_date = models.DateTimeField(
    "creation date",
    auto_now_add=True,
    editable=False,
    null=False,
    help_text="Date of creation of the measurement unit",
  )
  update_date = models.DateTimeField(
    "update date",
    auto_now=True,
    editable=False,
    null=False,
    help_text="Date of last modification one of the measurement unit",
  )

  class Meta:
    verbose_name = "measurement-unit"
    verbose_name_plural = "measurement-units"

  def __str__(self):
    return self.name


class IngredientQuantity(models.Model):
  """
  Quantity of a Ingredient in a Recipe
  """

  id = models.AutoField(primary_key=True)
  quantity = models.DecimalField(
    decimal_places=2,
    max_digits=6,
    null=False,
    validators=[MinValueValidator(0)]
  )
  measurement_unit = models.ForeignKey(
    MeasurementUnit,
    on_delete=models.CASCADE,
    null=False,
    related_name="ingredient_quantity",
  )
  ingredient = models.ForeignKey(
    Ingredient,
    on_delete=models.CASCADE,
    null=False,
    related_name="quantity",
  )
  recipe = models.ForeignKey(
    Recipe,
    on_delete=models.CASCADE,
    null=False,
    related_name="recipe_quantity",
  )
  creation_date = models.DateTimeField(
    "creation date",
    auto_now_add=True,
    editable=False,
    null=False,
    help_text="Date of creation of the measurement unit",
  )
  update_date = models.DateTimeField(
    "update date",
    auto_now=True,
    editable=False,
    null=False,
    help_text="Date of last modification one of the measurement unit",
  )

  class Meta:
    verbose_name = "ingredient-quantity"
    verbose_name_plural = "ingredient-quantities"

  def __str__(self):
    return str(
      self.quantity) + " " + self.measurement_unit.name + " of " + self.ingredient.name + " for the " + self.recipe.title

  def save(self, *args, **kwargs):
    """
    Override the save method to assign the permission
    """
    super().save(*args, **kwargs)
    # Set user permissions
    assign_all_perm(self, self.recipe.author)


class Category(models.Model):
  """
  A specific type of recipe
  """

  id = models.AutoField(primary_key=True)
  name = models.CharField(
    "name", max_length=50, blank=False, null=False, help_text="Name of the category"
  )
  recipes = models.ManyToManyField(Recipe, blank=True)

  class Meta:
    verbose_name = "category"
    verbose_name_plural = "categories"

  def __str__(self):
    return self.name


class Registration(models.Model):
  """
  A registration request
  """

  id = models.AutoField(primary_key=True)
  username = models.CharField(
    "user name", max_length=50, blank=False, null=False, help_text="Name of the account"
  )
  first_name = models.CharField(
    "first name", max_length=50, blank=True, null=True, help_text="First name of the user"
  )
  last_name = models.CharField(
    "last name", max_length=50, blank=True, null=True, help_text="Last name of the user"
  )
  email = models.CharField(
    "email", max_length=50, blank=False, null=False, help_text="Email of the user"
  )
  reason = models.TextField(
    "reason", blank=False, null=False, help_text="The registration request reason",
  )
  is_rejected = models.BooleanField(
    "is rejected",
    null=False,
    default=False,
    help_text="True if the registration request is rejected",
  )
  logical_delete = models.BooleanField(
    "logical delete",
    null=False,
    default=False,
    help_text="True if the registration request is closed",
  )
  creation_date = models.DateTimeField(
    "creation date",
    auto_now_add=True,
    editable=False,
    null=False,
    help_text="Date of creation of the registration request",
  )
  update_date = models.DateTimeField(
    "update date",
    auto_now=True,
    editable=False,
    null=False,
    help_text="Date of last modification of the registration request",
  )

  class Meta:
    verbose_name = "registration"
    verbose_name_plural = "registrations"

  def __str__(self):
    return self.username
