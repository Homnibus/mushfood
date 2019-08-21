from rest_framework import permissions

class ObjectPermissionsOrReadOnly(permissions.DjangoObjectPermissions):
    """
    Similar to `DjangoObjectPermissions`, but adding read only permissions.
    """
    authenticated_users_only = False
