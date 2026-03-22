from app.services.order_service import handle_create_order
from app.models.order_model import Order

def create_order(order: Order):
    return handle_create_order(order.dict())