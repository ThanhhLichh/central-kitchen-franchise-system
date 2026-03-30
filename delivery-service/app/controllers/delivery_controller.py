from sqlalchemy.orm import Session

from app.schemas.delivery_schema import DeliveryCreate, DeliveryStatusUpdate
from app.services.delivery_service import (
    handle_create_delivery,
    handle_get_deliveries,
    handle_get_delivery_by_id,
    handle_update_delivery_status,
)


def create_delivery(db: Session, delivery_data: DeliveryCreate):
    return handle_create_delivery(db, delivery_data)


def get_deliveries(db: Session):
    return handle_get_deliveries(db)


def get_delivery_by_id(db: Session, delivery_id: int):
    return handle_get_delivery_by_id(db, delivery_id)


def update_delivery_status(db: Session, delivery_id: int, payload: DeliveryStatusUpdate):
    return handle_update_delivery_status(db, delivery_id, payload)
