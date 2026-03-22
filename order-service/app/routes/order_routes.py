from fastapi import APIRouter
from app.controllers.order_controller import create_order
from app.models.order_model import Order

router = APIRouter()

@router.post("/orders")
def create_order_route(order: Order):
    return create_order(order)