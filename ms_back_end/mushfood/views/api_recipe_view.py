from django_filters.rest_framework import (DjangoFilterBackend, FilterSet, Filter, BooleanFilter)
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

from mushfood.guardian_permissions import ObjectPermissionsOrReadOnly
from mushfood.models import Recipe
from mushfood.serializers import RecipeSerializer


class StandardResultsSetPagination(PageNumberPagination):
  page_size_query_param = 'size'


class InAllCharListFilter(Filter):
  def filter(self, qs, value):
    if value not in (None, ''):
      charList = [string for string in value.split(',')]
      filteredQs = qs
      for char in charList:
        filteredQs = filteredQs.filter(**{'%s__in' % (self.field_name): [char]})
      return filteredQs
    return qs


class RecipeFilter(FilterSet):
  category__name = InAllCharListFilter(field_name='category__name')
  no_variant = BooleanFilter(field_name='variant_of', lookup_expr='isnull')

  class Meta:
    model = Recipe
    fields = ['logical_delete', 'category__name', 'id']


class RecipeViewSet(viewsets.ModelViewSet):
  queryset = Recipe.objects.all().order_by('-creation_date')
  serializer_class = RecipeSerializer
  lookup_field = 'slug'
  permission_classes = (ObjectPermissionsOrReadOnly,)
  filter_backends = [SearchFilter, DjangoFilterBackend]
  filter_class = RecipeFilter
  search_fields = ['title', 'recipe_group__group_quantity__ingredient__name', '=author__username', 'variant__title',
                   'variant__recipe_group__group_quantity__ingredient__name']
  pagination_class = StandardResultsSetPagination
