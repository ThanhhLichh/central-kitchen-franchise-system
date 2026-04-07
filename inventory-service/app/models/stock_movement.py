from app.config.db import db
from datetime import datetime

class StockMovement(db.Model):
    __tablename__ = "stock_movements"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer)
    change = db.Column(db.Integer)
    type = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)