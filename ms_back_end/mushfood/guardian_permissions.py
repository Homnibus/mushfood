from rest_framework import permissions


class ObjectPermissionsOrReadOnly(permissions.DjangoObjectPermissions):
    """
    Similar to `DjangoObjectPermissions`, but adding read only permissions.
    """
    authenticated_users_only = False


class MyUserPermissions(permissions.BasePermission):
    """
    Handles permissions for users.  The basic rules are

     - owner may GET, PUT, POST, DELETE
     - nobody else can access
     """

    def has_permission(self, request, view):
        # Only admin can create users
        if request.method == "POST":
            return request.user.is_superuser

        return True

    def has_object_permission(self, request, view, obj):
        # check if requesting user is the user requested
        return request.user == obj


class RegistrationPermissions(permissions.BasePermission):
    """
    Handles permissions for registration.

     - anyone can create
     - only admin can GET, POST, DELETE
     """

    def has_permission(self, request, view):
        if request.method == "POST":
            return True

        # check if user is admin
        return request.user.is_superuser
