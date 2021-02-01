from rest_framework import viewsets
from mushfood.models import Category
from mushfood.serializers import CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
  queryset = Category.objects.all()
  serializer_class = CategorySerializer

