from rest_framework import viewsets

from mushfood.guardian_permissions import ObjectPermissionsOrReadOnly
from mushfood.models import Recipe
from mushfood.serializers import RecipeSerializer


class RecipeViewSet(viewsets.ModelViewSet):
  queryset = Recipe.objects.all().order_by('-creation_date')
  serializer_class = RecipeSerializer
  lookup_field = 'slug'
  permission_classes = (ObjectPermissionsOrReadOnly,)
  filterset_fields = ['logical_delete']
