from rest_framework import permissions
from rest_framework import viewsets

from mushfood.models import Ingredient
from mushfood.serializers import IngredientSerializer


class IngredientViewSet(viewsets.ModelViewSet):
  queryset = Ingredient.objects.all().order_by('-creation_date')
  serializer_class = IngredientSerializer
  permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
