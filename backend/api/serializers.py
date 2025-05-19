from rest_framework import serializers
from .models import Product, Order, OrderItem, BakeSalePeriod

from rest_framework import serializers
from .models import Product, Order, OrderItem


class ProductSerializer(serializers.ModelSerializer):
    initialStock = serializers.IntegerField(source="initial_stock")
    isLimited = serializers.BooleanField(source="is_limited")

    class Meta:
        model = Product
        fields = [
            "id", "name", "category", "price", "stock",
            "initialStock", "image", "isLimited"
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    productId = serializers.CharField(source="product.id")
    packed = serializers.BooleanField()

    class Meta:
        model = OrderItem
        fields = ["productId", "quantity", "price", "total", "packed"]


class OrderSerializer(serializers.ModelSerializer):
    customerName = serializers.CharField(source="customer_name")
    contactNumber = serializers.CharField(source="contact_number")
    isPickup = serializers.BooleanField(source="is_pickup")
    totalItems = serializers.IntegerField(source="total_items")
    createdAt = serializers.DateTimeField(source="created_at", required=False)
    isPaid = serializers.BooleanField(source="is_paid", required=False)
    isPacked = serializers.BooleanField(source="is_packed", required=False)
    packedItems = serializers.ListField(required=False)
    packingNotes = serializers.CharField(required=False, allow_blank=True)

    items = OrderItemSerializer(many=True, required=False)

    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()

    class Meta:
        model = Order
        fields = [
            "id", "customerName", "contactNumber", "isPickup", "totalItems", "createdAt",
            "isPaid", "isPacked", "packedItems", "packingNotes", "items",
            "subtotal", "discount", "total", "status"
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        validated_data.pop("packedItems", None)
        validated_data.pop("packingNotes", None)
        validated_data.pop("is_packed", None)

        order = Order.objects.create(**validated_data)

        order_items = []
        for item_data in items_data:
            product_id = item_data.pop("product")["id"]
            order_items.append(OrderItem(order=order, product_id=product_id, **item_data))

        OrderItem.objects.bulk_create(order_items)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])
        validated_data.pop("packedItems", None)
        validated_data.pop("packingNotes", None)
        validated_data.pop("is_packed", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data:
            instance.items.all().delete()

            order_items = []
            for item_data in items_data:
                product_id = item_data.pop("product")["id"]
                order_items.append(OrderItem(order=instance, product_id=product_id, **item_data))

            OrderItem.objects.bulk_create(order_items)

        return instance


class BakeSalePeriodSerializer(serializers.ModelSerializer):
    startDate = serializers.DateTimeField(source="start_date")
    endDate = serializers.DateTimeField(source="end_date")
    isActive = serializers.BooleanField(source="is_active")

    class Meta:
        model = BakeSalePeriod
        fields = ["id", "name", "startDate", "endDate", "isActive"]
