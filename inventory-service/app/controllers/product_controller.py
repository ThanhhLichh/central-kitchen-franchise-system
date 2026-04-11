from flask import request, jsonify
from app.services.product_service import *

def create_product_controller():
    data = request.get_json()

    if not data or "name" not in data or "unit" not in data:
        return jsonify({"error": "Invalid input"}), 400

    result = create_product(data["name"], data["unit"])

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify({
        "id": result.id,
        "name": result.name,
        "unit": result.unit
    }), 201


def get_products_controller():
    products = get_products()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "unit": p.unit
        }
        for p in products
    ]), 200