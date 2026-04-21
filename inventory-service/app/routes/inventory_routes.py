from flask import Blueprint
from app.controllers.inventory_controller import *

inventory_bp = Blueprint("inventory", __name__)

@inventory_bp.route("/inventory", methods=["GET"])
def get_inventory():
    return get_inventory_controller()

@inventory_bp.route("/check-stock", methods=["POST"])
def check_stock():
    return check_stock_controller()

@inventory_bp.route("/inventory/import", methods=["POST"])
def import_stock():
    print("DB URL:", db.engine.url)
    return import_stock_controller()

@inventory_bp.route("/inventory/export", methods=["POST"])
def export_stock():
    return export_stock_controller()

@inventory_bp.route("/inventory/store/<store_id>", methods=["GET"])
def get_store_inventory(store_id):
    return get_store_inventory_controller(store_id)

@inventory_bp.route("/inventory/store/import", methods=["POST"])
def import_store_stock():
    return import_store_stock_controller()