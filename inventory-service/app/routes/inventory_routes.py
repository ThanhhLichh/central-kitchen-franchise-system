from flask import Blueprint
from app.controllers.inventory_controller import *

inventory_bp = Blueprint("inventory", __name__)

inventory_bp.route("/check-stock", methods=["POST"])(check_stock_controller)
inventory_bp.route("/inventory/import", methods=["POST"])(import_stock_controller)