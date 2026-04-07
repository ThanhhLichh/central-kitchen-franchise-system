from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.delivery_schema import DeliveryCreate, DeliveryStatusUpdate
from app.services.delivery_service import (
    handle_create_delivery,
    handle_get_deliveries,
    handle_get_delivery_by_id,
    handle_update_delivery_status,
)


async def create_delivery(db: AsyncSession, delivery_data: DeliveryCreate):
    return await handle_create_delivery(db, delivery_data)


async def get_deliveries(db: AsyncSession):
    return await handle_get_deliveries(db)


async def get_delivery_by_id(db: AsyncSession, delivery_id: int):
    return await handle_get_delivery_by_id(db, delivery_id)


async def update_delivery_status(db: AsyncSession, delivery_id: int, payload: DeliveryStatusUpdate):
    return await handle_update_delivery_status(db, delivery_id, payload)