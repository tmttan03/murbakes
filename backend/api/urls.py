from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet, BakeSalePeriodViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'bake-sales', BakeSalePeriodViewSet)

urlpatterns = router.urls
