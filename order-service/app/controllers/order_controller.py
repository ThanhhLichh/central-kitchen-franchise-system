from sqlalchemy.orm import Session

from app.schemas.order_schema import OrderCreate, OrderStatusUpdate
from app.services.order_service import (
    handle_create_order,
    handle_get_order_by_id,
    handle_get_orders,
    handle_update_order_status,
)


def create_order(db: Session, order: OrderCreate):
    return handle_create_order(db, order)


def get_orders(db: Session):
    return handle_get_orders(db)


def get_order_by_id(db: Session, order_id: int):
    return handle_get_order_by_id(db, order_id)


def update_order_status(db: Session, order_id: int, payload: OrderStatusUpdate):
    return handle_update_order_status(db, order_id, payload.status.value)