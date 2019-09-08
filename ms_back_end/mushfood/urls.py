from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token

from mushfood import views

api_router = routers.DefaultRouter()
api_router.register(r'recipes', views.RecipeViewSet, base_name='recipe')
api_router.register(r'recipe-images', views.RecipeImageViewSet, base_name='recipe-image')
api_router.register(r'measurement-units', views.MeasurementUnitViewSet, base_name='measurement-unit')
api_router.register(r'ingredients', views.IngredientViewSet, base_name='ingredient')
api_router.register(r'ingredient-images', views.IngredientImageViewSet, base_name='ingredient-image')
api_router.register(r'ingredient-quantities', views.IngredientQuantityViewSet, base_name='ingredient-quantity')

urlpatterns = [
  path("api/", include(api_router.urls), name="api"),
  path('api-auth/', obtain_auth_token, name='api_auth'),
]
