from app.models.inventory import Inventory
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
    stock = Inventory.query.filter_by(product_id=product_id).first()

    if stock:
        stock.quantity += quantity
    else:
        stock = Inventory(product_id=product_id, quantity=quantity)
        db.session.add(stock)

    db.session.commit()

    return {"message": "Stock updated"}

def export_stock(items):
    missing_items = []

    for item in items:
        product_id = item["product_id"]
        qty = item["quantity"]

        stock = Inventory.query.filter_by(product_id=product_id).first()

        if not stock or stock.quantity < qty:
            missing_items.append({
                "product_id": product_id
            })

    if missing_items:
        return {
            "success": False,
            "missing_items": missing_items
        }

    # đủ hàng → trừ kho
    for item in items:
        stock = Inventory.query.filter_by(product_id=item["product_id"]).first()
        stock.quantity -= item["quantity"]

    db.session.commit()

    return {"success": True}

