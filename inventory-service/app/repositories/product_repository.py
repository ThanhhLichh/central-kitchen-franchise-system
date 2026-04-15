from app.models.product import Product
from app.config.db import db

class ProductRepository:

    @staticmethod
    def get_by_id(product_id):
        return db.session.get(Product, product_id)

    @staticmethod
    def get_by_ids(ids):
        return Product.query.filter(Product.id.in_(ids)).all()

    @staticmethod
    def get_all():
        return Product.query.all()

    @staticmethod
    def create(name, unit):
        product = Product(name=name, unit=unit)

        db.session.add(product)
        db.session.commit()   

        return product