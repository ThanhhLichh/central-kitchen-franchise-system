from flask import Blueprint
from app.controllers.product_controller import *

product_bp = Blueprint("product", __name__)

product_bp.route("/products", methods=["POST"])(create_product_controller)
product_bp.route("/products", methods=["GET"])(get_products_controller)