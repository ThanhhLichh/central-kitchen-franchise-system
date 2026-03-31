from flask import request, jsonify
from app.services.inventory_service import *

def get_inventory_controller():
    data = get_inventory()
    return jsonify(data)

def check_stock_controller():
    data = request.get_json()
    result = check_stock(data["items"])
    return jsonify(result)


def import_stock_controller():
    data = request.get_json()
    result = import_stock(data["product_id"], data["quantity"])
    return jsonify(result)

def export_stock_controller():
    data = request.get_json()
    result = export_stock(data["items"])
    return jsonify(result)