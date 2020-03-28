from rest_framework import viewsets

from mushfood.guardian_permissions import ObjectPermissionsOrReadOnly
from mushfood.models import RecipeImage
from mushfood.serializers import RecipeImageSerializer


class RecipeImageViewSet(viewsets.ModelViewSet):
  queryset = RecipeImage.objects.all().order_by('-creation_date')
  serializer_class = RecipeImageSerializer
  permission_classes = (ObjectPermissionsOrReadOnly,)
  filterset_fields = ['recipe__id', 'recipe__slug']
