from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token

from mushfood import views

api_router = routers.DefaultRouter()
api_router.register(r'recipes', views.RecipeViewSet, base_name='recipe')
api_router.register(r'recipe-images', views.RecipeImageViewSet, base_name='recipe-image')

urlpatterns = [
  path("api/", include(api_router.urls), name="api"),
  path('api-auth/', obtain_auth_token, name='api_auth'),
]
