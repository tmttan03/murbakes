from django.db import models


class Product(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    initial_stock = models.IntegerField()
    image = models.TextField()
    is_limited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class BakeSalePeriod(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    id = models.CharField(primary_key=True, max_length=100)
    customer_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=255)
    is_pickup = models.BooleanField()
    delivery_address = models.TextField(blank=True, null=True)
    delivery_time = models.CharField(max_length=100, blank=True, null=True)
    total_items = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=100, blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    bake_sale_period = models.ForeignKey(
        BakeSalePeriod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    source_image = models.TextField(blank=True, null=True)


class OrderItem(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    packed = models.BooleanField(default=False)  # ✅ Add this


    def save(self, *args, **kwargs):
        self.total = self.quantity * self.price
        super().save(*args, **kwargs)