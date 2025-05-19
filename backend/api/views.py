from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Product, Order, OrderItem, BakeSalePeriod
from .serializers import ProductSerializer, OrderSerializer, OrderItemSerializer, BakeSalePeriodSerializer
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.db import transaction

# ---- Products ----
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        product_id = data.get("id")
        instance = Product.objects.filter(id=product_id).first()
        if instance:
            serializer = self.get_serializer(instance, data=data)
        else:
            serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---- Orders ----
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        order_id = data.get("id")
        instance = Order.objects.filter(id=order_id).first()

        # Create if new, update if exists
        serializer = self.get_serializer(instance, data=data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ---- Bake Sale Periods ----
class BakeSalePeriodViewSet(viewsets.ModelViewSet):
    queryset = BakeSalePeriod.objects.all()
    serializer_class = BakeSalePeriodSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        instance = BakeSalePeriod.objects.filter(id=data.get("id")).first()

        # Pass to serializer for create or update
        serializer = self.get_serializer(instance, data=data)
        serializer.is_valid(raise_exception=True)
        bake_sale = serializer.save()

        return Response(self.get_serializer(bake_sale).data, status=status.HTTP_201_CREATED)
