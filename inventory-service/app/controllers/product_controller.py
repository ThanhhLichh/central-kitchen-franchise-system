from flask import request, jsonify
from app.services.product_service import *

def create_product_controller():
    data = request.get_json()
    product = create_product(data["name"], data["unit"])

    return jsonify({
        "id": product.id,
        "name": product.name,
        "unit": product.unit
    })


def get_products_controller():
    products = get_products()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "unit": p.unit
        }
        for p in products
    ])