from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.delivery import Delivery

ALLOWED_TRANSITIONS = {
    "pending": ["shipping"],
    "shipping": ["delivered"],
    "delivered": []
}


async def handle_create_delivery(db: AsyncSession, delivery_data):
    try:
        new_delivery = Delivery(
            order_id=delivery_data.order_id,
            status="pending",
            delivery_date=delivery_data.delivery_date
        )
        db.add(new_delivery)
        await db.commit()
        await db.refresh(new_delivery)

        return {
            "delivery_id": new_delivery.id,
            "order_id": new_delivery.order_id,
            "status": new_delivery.status
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Create delivery failed: {str(e)}")


async def handle_get_deliveries(db: AsyncSession):
    try:
        result = await db.execute(select(Delivery).order_by(Delivery.created_at.desc()))
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get deliveries failed: {str(e)}")


async def handle_get_delivery_by_id(db: AsyncSession, delivery_id: int):
    result = await db.execute(select(Delivery).filter(Delivery.id == delivery_id))
    delivery = result.scalars().first()

    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    return delivery


async def handle_update_delivery(db: AsyncSession, delivery_id: int, payload):
    try:
        result = await db.execute(select(Delivery).filter(Delivery.id == delivery_id))
        delivery = result.scalars().first()

        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery not found")

        delivery.delivery_date = payload.delivery_date
        await db.commit()
        await db.refresh(delivery)

        return {
            "message": "Delivery updated successfully",
            "delivery_id": delivery.id,
            "delivery_date": str(delivery.delivery_date)
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Update delivery failed: {str(e)}")


async def handle_update_delivery_status(db: AsyncSession, delivery_id: int, payload):
    try:
        result = await db.execute(select(Delivery).filter(Delivery.id == delivery_id))
        delivery = result.scalars().first()

        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery not found")

        new_status = payload.status.value
        current_status = delivery.status

        if new_status == current_status:
            return {
                "message": "Delivery status unchanged",
                "delivery_id": delivery.id,
                "status": delivery.status
            }

        if new_status not in ALLOWED_TRANSITIONS.get(current_status, []):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition from '{current_status}' to '{new_status}'"
            )

        delivery.status = new_status
        await db.commit()
        await db.refresh(delivery)

        return {
            "message": "Delivery status updated successfully",
            "delivery_id": delivery.id,
            "status": delivery.status
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Update status failed: {str(e)}")