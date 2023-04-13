from rest_framework import viewsets

from mushfood.custom_view_set import CreationModelViewSet
from mushfood.guardian_permissions import ObjectPermissionsOrReadOnly
from mushfood.models import IngredientQuantity
from mushfood.serializers import IngredientQuantitySerializer, IngredientQuantityCreateSerializer


class IngredientQuantityViewSet(viewsets.ModelViewSet, CreationModelViewSet):
  queryset = IngredientQuantity.objects.all().order_by('rank','-creation_date')
  serializer_class = IngredientQuantitySerializer
  permission_classes = (ObjectPermissionsOrReadOnly,)
  create_serializer_class = IngredientQuantityCreateSerializer
  update_serializer_class = IngredientQuantityCreateSerializer
  filterset_fields = ['ingredient_group__recipe__id']