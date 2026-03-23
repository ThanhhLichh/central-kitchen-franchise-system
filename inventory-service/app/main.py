from flask import Flask
from app.config.db import init_db, db
from app.routes.inventory_routes import inventory_bp

def create_app():
    app = Flask(__name__)

    init_db(app)

    app.register_blueprint(inventory_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app