from rest_framework.authtoken.admin import User
from rest_framework.viewsets import ModelViewSet

from mushfood.custom_view_set import CreationModelViewSet
from mushfood.guardian_permissions import MyUserPermissions
from mushfood.serializers import UserSerializer, UserCreateSerializer


class UserViewSet(ModelViewSet, CreationModelViewSet):
  queryset = User.objects.all()
  serializer_class = UserSerializer
  lookup_field = 'username'
  permission_classes = (MyUserPermissions,)
  create_serializer_class = UserCreateSerializer
  update_serializer_class = UserSerializer
