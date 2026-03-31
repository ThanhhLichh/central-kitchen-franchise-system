from app.models.product import Product
from app.config.db import db

def create_product(name, unit):
    product = Product(name=name, unit=unit)
    db.session.add(product)
    db.session.commit()
    return product


def get_products():
    return Product.query.all()