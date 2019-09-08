from rest_framework import viewsets, permissions

from mushfood.models import IngredientImage
from mushfood.serializers import IngredientImageSerializer


class ReadOnly(permissions.BasePermission):
  def has_permission(self, request, view):
    return request.method in permissions.SAFE_METHODS


class IngredientImageViewSet(viewsets.ModelViewSet):
  queryset = IngredientImage.objects.all().order_by('-creation_date')
  serializer_class = IngredientImageSerializer
  permission_classes = (permissions.IsAdminUser | ReadOnly,)
  filterset_fields = ['ingredient__id']
