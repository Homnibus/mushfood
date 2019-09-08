from rest_framework import viewsets

from mushfood.models import MeasurementUnit
from mushfood.serializers import MeasurementUnitSerializer


class MeasurementUnitViewSet(viewsets.ReadOnlyModelViewSet):
  queryset = MeasurementUnit.objects.all().order_by('-creation_date')
  serializer_class = MeasurementUnitSerializer
