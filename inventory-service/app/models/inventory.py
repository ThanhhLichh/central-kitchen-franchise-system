from app.config.db import db

class Inventory(db.Model):
    __tablename__ = "inventory"

    product_id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, default=0)