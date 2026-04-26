from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload
import os
import requests

from app.models.order import Order, OrderItem
from app.mq.publisher import publish_order


STORE_ROLE = "FranchiseStoreStaff"
BACKOFFICE_ROLES = {
    "CentralKitchenStaff",
    "SupplyCoordinator",
    "Manager",
    "Admin",
}
INVENTORY_SERVICE_URL = os.getenv("INVENTORY_SERVICE_URL", "http://inventory_service:5000")


def extract_roles(current_user: dict) -> list[str]:
    possible_role_keys = [
        "role",
        "roles",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role",
    ]

    roles = []

    for key in possible_role_keys:
        value = current_user.get(key)
        if not value:
            continue

        if isinstance(value, list):
            roles.extend(value)
        else:
            roles.append(value)

    return roles


def has_role(current_user: dict, allowed_roles: set[str]) -> bool:
    user_roles = set(extract_roles(current_user))
    return len(user_roles.intersection(allowed_roles)) > 0


def is_store_staff(current_user: dict) -> bool:
    return has_role(current_user, {STORE_ROLE})


def is_backoffice_user(current_user: dict) -> bool:
    return has_role(current_user, BACKOFFICE_ROLES)


def handle_create_order(db: Session, order_data, current_user: dict):
    try:
        user_id = current_user.get("UserId")
        store_id = current_user.get("StoreId")

        if not user_id:
            raise HTTPException(status_code=401, detail="UserId not found in token")

        if not is_store_staff(current_user):
            raise HTTPException(
                status_code=403,
                detail="Only FranchiseStoreStaff can create orders"
            )

        if not store_id:
            raise HTTPException(status_code=403, detail="StoreId not found in token")

        items_payload = [
            {
                "product_id": item.product_id,
                "quantity": item.quantity
            }
            for item in order_data.items
        ]

        # check stock trước
        stock_result = check_inventory_stock(items_payload)
        available = stock_result.get("available", False)
        missing_items = stock_result.get("missing_items", [])

        new_order = Order(
            store_id=str(store_id),
            created_by=str(user_id),
            status="pending" if available else "waiting_production"
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

        # chỉ publish nếu đủ hàng
        if available:
            publish_order(items_payload)

        return {
            "order_id": new_order.id,
            "status": new_order.status,
            "missing_items": missing_items
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Create order failed: {str(e)}")

def check_inventory_stock(items: list[dict]) -> dict:
    try:
        response = requests.post(
            f"{INVENTORY_SERVICE_URL}/check-stock",
            json={"items": items},
            timeout=5
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check inventory stock: {str(e)}"
        )
    
def handle_get_orders(db: Session, current_user: dict):
    try:
        query = (
            db.query(Order)
            .options(selectinload(Order.items))
            .order_by(Order.created_at.desc())
        )

        if is_store_staff(current_user):
            store_id = current_user.get("StoreId")

            if not store_id:
                raise HTTPException(status_code=403, detail="StoreId not found in token")

            orders = query.filter(Order.store_id == str(store_id)).all()
            return [build_order_response(order) for order in orders]

        if is_backoffice_user(current_user):
            orders = query.all()
            return [build_order_response(order) for order in orders]

        raise HTTPException(status_code=403, detail="You do not have permission to view orders")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get orders failed: {str(e)}")


def handle_get_order_by_id(db: Session, order_id: int, current_user: dict):
    try:
        query = (
            db.query(Order)
            .options(selectinload(Order.items))
            .filter(Order.id == order_id)
        )

        if is_store_staff(current_user):
            store_id = current_user.get("StoreId")

            if not store_id:
                raise HTTPException(status_code=403, detail="StoreId not found in token")

            order = query.filter(Order.store_id == str(store_id)).first()

        elif is_backoffice_user(current_user):
            order = query.first()

        else:
            raise HTTPException(status_code=403, detail="You do not have permission to view this order")

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        return build_order_response(order)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get order failed: {str(e)}")

def build_order_response(order: Order) -> dict:
    items_data = [
        {
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity
        }
        for item in order.items
    ]

    missing_items = []

    if order.status == "waiting_production":
        stock_result = check_inventory_stock([
            {
                "product_id": item.product_id,
                "quantity": item.quantity
            }
            for item in order.items
        ])
        missing_items = stock_result.get("missing_items", [])

    return {
        "id": order.id,
        "store_id": order.store_id,
        "created_by": order.created_by,
        "status": order.status,
        "created_at": order.created_at,
        "items": items_data,
        "missing_items": missing_items
    }


def handle_update_order_status(
    db: Session,
    order_id: int,
    new_status: str,
    current_user: dict
):
    try:
        order = db.query(Order).filter(Order.id == order_id).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        current_status = order.status

        # 1) Store staff chỉ được completed đơn của store mình
        if is_store_staff(current_user):
            store_id = current_user.get("StoreId")

            if not store_id:
                raise HTTPException(status_code=403, detail="StoreId not found in token")

            if str(order.store_id) != str(store_id):
                raise HTTPException(status_code=403, detail="You can only update orders of your own store")

            # Store staff được complete hoặc cancel
            if new_status not in {"completed", "cancelled"}:
                raise HTTPException(
                    status_code=403,
                    detail="FranchiseStoreStaff can only update order status to completed or cancelled"
                )

            if new_status == "completed":
                if current_status != "processing":
                    raise HTTPException(
                        status_code=400,
                        detail=f"Store can only complete orders that are in 'processing' status, current status is '{current_status}'"
                    )

            if new_status == "cancelled":
                if current_status not in {"pending", "waiting_production"}:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Store can only cancel orders that are in 'pending' or 'waiting_production', current status is '{current_status}'"
                    )

            # 2) Backoffice chỉ được pending -> processing
            elif is_backoffice_user(current_user):
                if new_status not in {"processing", "waiting_production"}:
                    raise HTTPException(
                        status_code=403,
                        detail="Backoffice users can only update order status to processing or waiting_production"
                    )

                if new_status == "processing":
                    if current_status not in {"pending", "waiting_production"}:
                        raise HTTPException(
                            status_code=400,
                            detail=(
                                "Backoffice can only move orders from "
                                f"'pending' or 'waiting_production' to 'processing', "
                                f"current status is '{current_status}'"
                            )
                        )

                if new_status == "waiting_production":
                    if current_status != "pending":
                        raise HTTPException(
                            status_code=400,
                            detail=(
                                "Backoffice can only move orders from "
                                f"'pending' to 'waiting_production', current status is '{current_status}'"
                            )
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