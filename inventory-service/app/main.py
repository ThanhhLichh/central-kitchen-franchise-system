from flask import Flask
from app.config.db import init_db, db
import time
from sqlalchemy.exc import OperationalError

from app.routes.product_routes import product_bp
from app.routes.inventory_routes import inventory_bp

# import model để create table
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.stock_movement import StockMovement


def create_app():
    app = Flask(__name__)

    init_db(app)

    app.register_blueprint(product_bp)
    app.register_blueprint(inventory_bp)

    with app.app_context():
        for i in range(10):
            try:
                print("Connecting to DB...")
                db.create_all()
                print("DB connected")
                break
            except OperationalError:
                print("DB not ready, retry...")
                time.sleep(3)

    return app