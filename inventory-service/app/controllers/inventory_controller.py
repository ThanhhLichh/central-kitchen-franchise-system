from flask import request, jsonify
from app.services.inventory_service import *

def get_inventory_controller():
    data = get_inventory()
    return jsonify(data), 200


def check_stock_controller():
    data = request.get_json()

    if not data or "items" not in data:
        return jsonify({"error": "Invalid input"}), 400

    result = check_stock(data["items"])

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200


def import_stock_controller():
    data = request.get_json()

    if not data or "product_id" not in data or "quantity" not in data:
        return jsonify({"error": "Invalid input"}), 400

    result = import_stock(data["product_id"], data["quantity"])

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200


def export_stock_controller():
    data = request.get_json()

    if not data or "items" not in data:
        return jsonify({"error": "Invalid input"}), 400

    result = export_stock(data["items"])

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200