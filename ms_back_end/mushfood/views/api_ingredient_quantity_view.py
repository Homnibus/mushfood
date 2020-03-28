from rest_framework import viewsets, permissions

from mushfood.custom_view_set import CreationModelViewSet
from mushfood.models import IngredientQuantity
from mushfood.serializers import IngredientQuantitySerializer, IngredientQuantityCreateSerializer


class IngredientQuantityViewSet(viewsets.ModelViewSet, CreationModelViewSet):
  queryset = IngredientQuantity.objects.all().order_by('-creation_date')
  serializer_class = IngredientQuantitySerializer
  permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
  create_serializer_class = IngredientQuantityCreateSerializer
  update_serializer_class = IngredientQuantityCreateSerializer
  filterset_fields = ['recipe__id']
