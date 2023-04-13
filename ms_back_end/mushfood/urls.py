from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token

from mushfood import views

api_router = routers.DefaultRouter()
api_router.register(r'recipes', views.RecipeViewSet, basename='recipe')
api_router.register(r'recipe-images', views.RecipeImageViewSet, basename='recipe-image')
api_router.register(r'measurement-units', views.MeasurementUnitViewSet, basename='measurement-unit')
api_router.register(r'ingredients', views.IngredientViewSet, basename='ingredient')
api_router.register(r'ingredient-images', views.IngredientImageViewSet, basename='ingredient-image')
api_router.register(r'ingredient-quantities', views.IngredientQuantityViewSet, basename='ingredient-quantity')
api_router.register(r'ingredient-groups', views.IngredientGroupViewSet, basename='ingredient-group')
api_router.register(r'categories', views.CategoryViewSet, basename='category')
api_router.register(r'user', views.UserViewSet, basename='user')
api_router.register(r'password', views.ChangePasswordViewSet, basename='password')
api_router.register(r'registrations', views.RegistrationViewSet, basename='registration')

urlpatterns = [
  path("api/", include(api_router.urls), name="api"),
  path('api-auth/', obtain_auth_token, name='api_auth'),
]
