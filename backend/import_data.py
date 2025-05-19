
import os
import django
import json
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Product, Order, OrderItem

# ---- Load Products ----
with open('products.json', 'r') as f:
    products = json.load(f)

for p in products:
    Product.objects.update_or_create(
        id=p['id'],
        defaults={
            'name': p['name'],
            'category': p['category'],
            'price': p['price'],
            'stock': p['stock'],
            'initial_stock': p.get('initialStock', p['stock']),
            'image': p['image'],
            'is_limited': p.get('isLimited', False)
        }
    )

print(f"Imported {len(products)} products.")

# ---- Load Orders ----
with open('orders.json', 'r') as f:
    orders = json.load(f)

for o in orders:
    order, created = Order.objects.update_or_create(
        id=o['id'],
        defaults={
            'customer_name': o['customerName'],
            'contact_number': o['contactNumber'],
            'is_pickup': o['isPickup'],
            'total_items': o['totalItems'],
            'subtotal': o['subtotal'],
            'discount': o['discount'],
            'total': o['total'],
            'created_at': datetime.fromisoformat(o['createdAt'].replace('Z', '+00:00')),
            'status': o['status'],
            'is_paid': o.get('isPaid', False),
        }
    )

    # Clear existing items and recreate
    order.items.all().delete()

    for item in o['items']:
        OrderItem.objects.create(
            order=order,
            product_id=item['productId'],
            quantity=item['quantity'],
            price=item['price'],
            total=item['total']
        )

print(f"Imported {len(orders)} orders with items.")
