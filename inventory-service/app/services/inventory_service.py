from app.models.inventory import Inventory
from app.models.stock_movement import StockMovement
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.product_repository import ProductRepository
from app.config.db import db

def get_inventory(location_type="central_kitchen", store_id=None):
    """
    Lấy danh sách tồn kho theo loại kho và ID cửa hàng.
    Mặc định trả về tồn kho của bếp trung tâm nếu không truyền tham số.
    """
    stocks = InventoryRepository.get_all(location_type=location_type, store_id=store_id)

    return [
        {
            "product_id": s.product_id,
            "quantity": s.quantity
        }
        for s in stocks
    ]

def check_stock(items, location_type="central_kitchen", store_id=None):
    """
    Kiểm tra xem số lượng tồn kho có đủ đáp ứng danh sách các mặt hàng (items) yêu cầu hay không.
    Kiểm tra trên loại kho và cửa hàng tương ứng được chỉ định.
    """
    missing_items = []

    for item in items:
        product_id = item["product_id"]
        required_qty = item["quantity"]

        # Lấy thông tin tồn kho cụ thể cho sản phẩm tại kho tương ứng
        stock = InventoryRepository.get_by_product_id(product_id, location_type, store_id)

        if not stock or stock.quantity < required_qty:
            missing_items.append({
                "product_id": product_id,
                "missing_quantity": required_qty - (stock.quantity if stock else 0)
            })

    return {
        "available": len(missing_items) == 0,
        "missing_items": missing_items
    }


def import_stock(product_id, quantity, location_type="central_kitchen", store_id=None):
    """
    Nhập kho cho một sản phẩm nhất định vào kho trung tâm hoặc kho cửa hàng.
    Nếu kho đã có sản phẩm thì cộng dồn số lượng, nếu chưa thì tạo dòng tồn kho mới.
    Đồng thời ghi nhận vào lịch sử biến động kho (StockMovement).
    """
    try:
        product = ProductRepository.get_by_id(product_id)
        if not product:
            return {
                "success": False,
                "error": f"Product {product_id} not found"
            }

        stock = InventoryRepository.get_by_product_id(product_id, location_type, store_id)

        # Cộng dồn nếu đã tồn tại, ngược lại tạo mới
        if stock:
            stock.quantity += quantity
        else:
            InventoryRepository.create(product_id, quantity, location_type, store_id)

        # Ghi log lịch sử giao dịch nhập kho
        movement = StockMovement(
            product_id=product_id,
            change=quantity,
            type="import",
            location_type=location_type,
            store_id=store_id
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

def export_stock(items, location_type="central_kitchen", store_id=None):
    """
    Trừ kho khi có yêu cầu xuất kho (ví dụ: nhận message từ RabbitMQ khi order được tạo).
    Kiểm tra tồn kho trước khi thực hiện trừ và ghi lại lịch sử biến động.
    """

    try:
        product_ids = [item["product_id"] for item in items]

        products = ProductRepository.get_by_ids(product_ids)
        product_map = {p.id: p for p in products}

        stocks = InventoryRepository.get_by_product_ids(product_ids, location_type, store_id)
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
                type="export",
                location_type=location_type,
                store_id=store_id
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
