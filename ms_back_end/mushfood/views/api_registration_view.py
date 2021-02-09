from rest_framework.viewsets import ModelViewSet

from mushfood.custom_view_set import CreationModelViewSet
from mushfood.guardian_permissions import RegistrationPermissions
from mushfood.models import Registration
from mushfood.serializers import RegistrationSerializer, RegistrationCreateSerializer


class RegistrationViewSet(ModelViewSet, CreationModelViewSet):
  queryset = Registration.objects.all().order_by('-creation_date')
  serializer_class = RegistrationSerializer
  permission_classes = (RegistrationPermissions,)
  create_serializer_class = RegistrationCreateSerializer
  update_serializer_class = RegistrationSerializer
  filterset_fields = ['logical_delete']
