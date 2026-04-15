from app.models.inventory import Inventory
from app.config.db import db

class InventoryRepository:

    @staticmethod
    def get_by_product_id(product_id: int):
        return Inventory.query.filter_by(product_id=product_id).first()

    @staticmethod
    def get_by_product_ids(product_ids):
        return Inventory.query.filter(
            Inventory.product_id.in_(product_ids)
        ).all()

    @staticmethod
    def create(product_id, quantity):
        stock = Inventory(product_id=product_id, quantity=quantity)

        db.session.add(stock)
        db.session.flush() 

        return stock

    @staticmethod
    def commit():
        db.session.commit()

    @staticmethod
    def rollback():
        db.session.rollback()