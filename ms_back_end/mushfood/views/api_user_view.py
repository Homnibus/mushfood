from rest_framework.authtoken.admin import User
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet

from mushfood.guardian_permissions import MyUserPermissions
from mushfood.serializers import UserSerializer


class UserViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):

  queryset = User.objects.all()
  serializer_class = UserSerializer
  lookup_field = 'username'
  permission_classes = (MyUserPermissions,)

