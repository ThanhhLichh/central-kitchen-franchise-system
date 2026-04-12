from app.models.inventory import Inventory
from app.models.stock_movement import StockMovement
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.product_repository import ProductRepository
from app.config.db import db

def get_inventory():
    stocks = Inventory.query.all()

    return [
        {
            "product_id": s.product_id,
            "quantity": s.quantity
        }
        for s in stocks
    ]

def check_stock(items):
    missing_items = []

    for item in items:
        product_id = item["product_id"]
        required_qty = item["quantity"]

        stock = Inventory.query.filter_by(product_id=product_id).first()

        if not stock or stock.quantity < required_qty:
            missing_items.append({
                "product_id": product_id,
                "missing_quantity": required_qty - (stock.quantity if stock else 0)
            })

    return {
        "available": len(missing_items) == 0,
        "missing_items": missing_items
    }


def import_stock(product_id, quantity):
    try:
        product = ProductRepository.get_by_id(product_id)
        if not product:
            return {
                "success": False,
                "error": f"Product {product_id} not found"
            }

        stock = InventoryRepository.get_by_product_id(product_id)

        if stock:
            stock.quantity += quantity
        else:
            InventoryRepository.create(product_id, quantity)

        # log
        movement = StockMovement(
            product_id=product_id,
            change=quantity,
            type="import"
        )
        db.session.add(movement)

        InventoryRepository.commit()

        return {
            "success": True,
            "message": "Stock updated"
        }

    except Exception as e:
        InventoryRepository.rollback()
        return {
            "success": False,
            "error": str(e)
        }

def export_stock(items):
    """
    Trừ kho khi nhận message từ RabbitMQ
    """

    try:
        product_ids = [item["product_id"] for item in items]

        products = ProductRepository.get_by_ids(product_ids)
        product_map = {p.id: p for p in products}

        stocks = InventoryRepository.get_by_product_ids(product_ids)
        stock_map = {s.product_id: s for s in stocks}

        missing_items = []

        for item in items:
            pid = item["product_id"]
            qty = item["quantity"]

            if pid not in product_map:
                return {
                    "success": False,
                    "error": f"Product {pid} not found"
                }

            stock = stock_map.get(pid)

            if not stock or stock.quantity < qty:
                missing_items.append({
                    "product_id": pid
                })

        if missing_items:
            return {
                "success": False,
                "missing_items": missing_items
            }

        for item in items:
            pid = item["product_id"]
            qty = item["quantity"]

            stock_map[pid].quantity -= qty

            movement = StockMovement(
                product_id=pid,
                change=-qty,
                type="export"
            )
            db.session.add(movement)

        InventoryRepository.commit()

        return {"success": True}

    except Exception as e:
        InventoryRepository.rollback()
        return {
            "success": False,
            "error": str(e)
        }
