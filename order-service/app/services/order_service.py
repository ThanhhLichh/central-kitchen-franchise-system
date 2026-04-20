from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderItem
from app.mq.publisher import publish_order


def handle_create_order(db: Session, order_data, current_user: dict):
    try:
        user_id = current_user.get("UserId")
        store_id = current_user.get("StoreId")

        if not user_id:
            raise HTTPException(status_code=401, detail="UserId not found in token")

        if not store_id:
            raise HTTPException(status_code=403, detail="StoreId not found in token")

        new_order = Order(
            store_id=str(store_id),
            created_by=str(user_id),
            status="pending"
        )

        for item in order_data.items:
            new_item = OrderItem(
                product_id=item.product_id,
                quantity=item.quantity
            )
            new_order.items.append(new_item)

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        publish_order([
            {
                "product_id": item.product_id,
                "quantity": item.quantity
            }
            for item in order_data.items
        ])

        return {
            "order_id": new_order.id,
            "status": new_order.status
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Create order failed: {str(e)}")


def handle_get_orders(db: Session, current_user: dict):
    try:
        store_id = current_user.get("StoreId")

        if not store_id:
            raise HTTPException(status_code=403, detail="StoreId not found in token")

        orders = (
            db.query(Order)
            .options(selectinload(Order.items))
            .filter(Order.store_id == str(store_id))
            .order_by(Order.created_at.desc())
            .all()
        )
        return orders
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get orders failed: {str(e)}")


def handle_get_order_by_id(db: Session, order_id: int, current_user: dict):
    try:
        store_id = current_user.get("StoreId")

        if not store_id:
            raise HTTPException(status_code=403, detail="StoreId not found in token")

        order = (
            db.query(Order)
            .options(selectinload(Order.items))
            .filter(Order.id == order_id, Order.store_id == str(store_id))
            .first()
        )

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        return order

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get order failed: {str(e)}")


def handle_update_order_status(
    db: Session,
    order_id: int,
    new_status: str,
    current_user: dict
):
    try:
        store_id = current_user.get("StoreId")

        if not store_id:
            raise HTTPException(status_code=403, detail="StoreId not found in token")

        order = (
            db.query(Order)
            .filter(Order.id == order_id, Order.store_id == str(store_id))
            .first()
        )

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        allowed_transitions = {
            "pending": ["processing"],
            "processing": ["completed"],
            "completed": []
        }

        current_status = order.status

        if new_status == current_status:
            return {
                "message": "Order status unchanged",
                "order_id": order.id,
                "status": order.status
            }

        if new_status not in allowed_transitions[current_status]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition from '{current_status}' to '{new_status}'"
            )

        order.status = new_status
        db.commit()
        db.refresh(order)

        return {
            "message": "Order status updated successfully",
            "order_id": order.id,
            "status": order.status
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update status failed: {str(e)}")