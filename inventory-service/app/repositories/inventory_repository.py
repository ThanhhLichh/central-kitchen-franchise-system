from app.models.inventory import Inventory
from app.config.db import db

class InventoryRepository:

    @staticmethod
    def get_by_product_id(product_id: int, location_type: str, store_id: str = None):
        """
        Lấy tồn kho của một sản phẩm theo loại kho và mã cửa hàng.
        """
        query = Inventory.query.filter_by(product_id=product_id, location_type=location_type)
        if store_id:
            query = query.filter_by(store_id=store_id)
        else:
            query = query.filter(Inventory.store_id.is_(None))
        return query.first()

    @staticmethod
    def get_by_product_ids(product_ids, location_type: str, store_id: str = None):
        """
        Lấy danh sách tồn kho cho nhiều sản phẩm cùng lúc.
        """
        query = Inventory.query.filter(
            Inventory.product_id.in_(product_ids),
            Inventory.location_type == location_type
        )
        if store_id:
            query = query.filter(Inventory.store_id == store_id)
        else:
            query = query.filter(Inventory.store_id.is_(None))
        return query.all()

    @staticmethod
    def get_all(location_type: str, store_id: str = None):
        """
        Lấy toàn bộ tồn kho tại một kho cụ thể.
        """
        query = Inventory.query.filter_by(location_type=location_type)
        if store_id:
            query = query.filter_by(store_id=store_id)
        else:
            query = query.filter(Inventory.store_id.is_(None))
        return query.all()

    @staticmethod
    def create(product_id, quantity, location_type: str, store_id: str = None):
        stock = Inventory(
            product_id=product_id,
            quantity=quantity,
            location_type=location_type,
            store_id=store_id
        )

        db.session.add(stock)
        db.session.flush() 

        return stock

    @staticmethod
    def commit():
        db.session.commit()

    @staticmethod
    def rollback():
        db.session.rollback()