from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.controllers.order_controller import (
    create_order,
    get_order_by_id,
    get_orders,
    update_order_status,
)
from app.database.db import get_db
from app.schemas.order_schema import (
    OrderCreate,
    OrderCreateResponse,
    OrderResponse,
    OrderStatusUpdate,
)

router = APIRouter(tags=["Orders"])


@router.post("/orders", response_model=OrderCreateResponse)
def create_order_route(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return create_order(db, order, current_user)


@router.get("/orders", response_model=List[OrderResponse])
def get_orders_route(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return get_orders(db, current_user)


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order_by_id_route(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return get_order_by_id(db, order_id, current_user)


@router.put("/orders/{order_id}/status")
def update_order_status_route(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return update_order_status(db, order_id, payload, current_user)