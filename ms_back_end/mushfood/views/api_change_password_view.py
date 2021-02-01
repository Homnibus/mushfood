from rest_framework.authtoken.admin import User
from rest_framework.mixins import UpdateModelMixin
from rest_framework.viewsets import GenericViewSet

from mushfood.guardian_permissions import MyUserPermissions
from mushfood.serializers import ChangePasswordSerializer


class ChangePasswordViewSet(UpdateModelMixin, GenericViewSet):

  queryset = User.objects.all()
  lookup_field = 'username'
  serializer_class = ChangePasswordSerializer
  permission_classes = (MyUserPermissions,)

