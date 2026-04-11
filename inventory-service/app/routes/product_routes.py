from flask import Blueprint
from app.controllers.product_controller import *

product_bp = Blueprint("product", __name__)

@product_bp.route("/products", methods=["POST"])
def create_product():
    return create_product_controller()

@product_bp.route("/products", methods=["GET"])
def get_products():
    return get_products_controller()