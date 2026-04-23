from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.delivery_controller import (
    create_delivery,
    get_deliveries,
    get_delivery_by_id,
    update_delivery,
    update_delivery_status,
)
from app.database.db import get_db
from app.schemas.delivery_schema import (
    DeliveryCreate,
    DeliveryCreateResponse,
    DeliveryResponse,
    DeliveryUpdate,
    DeliveryStatusUpdate,
)

router = APIRouter(tags=["Deliveries"])


@router.post("/deliveries", response_model=DeliveryCreateResponse)
async def create_delivery_route(delivery: DeliveryCreate, db: AsyncSession = Depends(get_db)):
    return await create_delivery(db, delivery)


@router.get("/deliveries", response_model=List[DeliveryResponse])
async def get_deliveries_route(db: AsyncSession = Depends(get_db)):
    return await get_deliveries(db)


@router.get("/deliveries/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery_by_id_route(delivery_id: int, db: AsyncSession = Depends(get_db)):
    return await get_delivery_by_id(db, delivery_id)


@router.put("/deliveries/{delivery_id}")
async def update_delivery_route(
    delivery_id: int,
    payload: DeliveryUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await update_delivery(db, delivery_id, payload)


@router.put("/deliveries/{delivery_id}/status")
async def update_delivery_status_route(
    delivery_id: int,
    payload: DeliveryStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await update_delivery_status(db, delivery_id, payload)