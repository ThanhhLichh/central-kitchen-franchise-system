from sqlalchemy.orm import Session

from app.schemas.order_schema import OrderCreate, OrderStatusUpdate
from app.services.order_service import (
    handle_create_order,
    handle_get_order_by_id,
    handle_get_orders,
    handle_update_order_status,
)


def create_order(db: Session, order: OrderCreate, current_user: dict):
    return handle_create_order(db, order, current_user)


def get_orders(db: Session, current_user: dict):
    return handle_get_orders(db, current_user)


def get_order_by_id(db: Session, order_id: int, current_user: dict):
    return handle_get_order_by_id(db, order_id, current_user)


def update_order_status(
    db: Session,
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: dict
):
    return handle_update_order_status(db, order_id, payload.status.value, current_user)