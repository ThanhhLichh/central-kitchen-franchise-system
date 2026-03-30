from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.delivery import Delivery

# Trạng thái hợp lệ và các chuyển đổi cho phép
ALLOWED_TRANSITIONS = {
    "pending": ["shipping"],
    "shipping": ["delivered"],
    "delivered": []
}


def handle_create_delivery(db: Session, delivery_data):
    try:
        new_delivery = Delivery(
            order_id=delivery_data.order_id,
            status="pending",
            delivery_date=delivery_data.delivery_date
        )
        db.add(new_delivery)
        db.commit()
        db.refresh(new_delivery)

        return {
            "delivery_id": new_delivery.id,
            "order_id": new_delivery.order_id,
            "status": new_delivery.status
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Create delivery failed: {str(e)}")


def handle_get_deliveries(db: Session):
    try:
        deliveries = (
            db.query(Delivery)
            .order_by(Delivery.created_at.desc())
            .all()
        )
        return deliveries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get deliveries failed: {str(e)}")


def handle_get_delivery_by_id(db: Session, delivery_id: int):
    try:
        delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()

        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery not found")

        return delivery

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get delivery failed: {str(e)}")


def handle_update_delivery_status(db: Session, delivery_id: int, payload):
    try:
        delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()

        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery not found")

        new_status = payload.status
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
        db.commit()
        db.refresh(delivery)

        return {
            "message": "Delivery status updated successfully",
            "delivery_id": delivery.id,
            "status": delivery.status
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update status failed: {str(e)}")
