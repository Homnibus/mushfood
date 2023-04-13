from rest_framework import viewsets

from mushfood.guardian_permissions import ObjectPermissionsOrReadOnly
from mushfood.models import IngredientGroup
from mushfood.serializers import IngredientGroupSerializer

class IngredientGroupViewSet(viewsets.ModelViewSet):
  queryset = IngredientGroup.objects.all().order_by('rank','-creation_date')
  serializer_class = IngredientGroupSerializer
  permission_classes = (ObjectPermissionsOrReadOnly,)
  filterset_fields = ['recipe__id']
