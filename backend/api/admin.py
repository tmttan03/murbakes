from django.contrib import admin
from .models import Product, Order, OrderItem, BakeSalePeriod

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ('product', 'quantity', 'price', 'total', 'packed')
    readonly_fields = ('total',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'customer_name',
        'contact_number',
        'total_amount',
        'total_items',
        'status',
        'is_paid',
        'created_at'
    )
    list_filter = ('status', 'is_paid', 'is_pickup')
    search_fields = ('id', 'customer_name', 'contact_number')
    inlines = [OrderItemInline]

    def total_amount(self, obj):
        return f"₱{obj.total:.2f}"
    total_amount.short_description = 'Total Amount'

    def total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())
    total_items.short_description = 'Pieces'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'price', 'stock', 'initial_stock', 'is_limited')
    list_filter = ('category', 'is_limited')
    search_fields = ('name', 'id')

@admin.register(BakeSalePeriod)
class BakeSalePeriodAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'id')
