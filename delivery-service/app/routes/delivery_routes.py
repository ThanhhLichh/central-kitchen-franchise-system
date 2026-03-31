from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers.delivery_controller import (
    create_delivery,
    get_deliveries,
    get_delivery_by_id,
    update_delivery_status,
)
from app.database.db import get_db
from app.schemas.delivery_schema import (
    DeliveryCreate,
    DeliveryCreateResponse,
    DeliveryResponse,
    DeliveryStatusUpdate,
)

router = APIRouter(tags=["Deliveries"])


@router.post("/deliveries", response_model=DeliveryCreateResponse)
def create_delivery_route(delivery: DeliveryCreate, db: Session = Depends(get_db)):
    return create_delivery(db, delivery)


@router.get("/deliveries", response_model=List[DeliveryResponse])
def get_deliveries_route(db: Session = Depends(get_db)):
    return get_deliveries(db)


@router.get("/deliveries/{delivery_id}", response_model=DeliveryResponse)
def get_delivery_by_id_route(delivery_id: int, db: Session = Depends(get_db)):
    return get_delivery_by_id(db, delivery_id)


@router.put("/deliveries/{delivery_id}/status")
def update_delivery_status_route(
    delivery_id: int,
    payload: DeliveryStatusUpdate,
    db: Session = Depends(get_db)
):
    return update_delivery_status(db, delivery_id, payload)
