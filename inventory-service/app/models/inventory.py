from app.config.db import db

class Inventory(db.Model):
    __tablename__ = "inventory"

    # ID tự tăng để cho phép 1 product có thể nằm ở nhiều kho (nhiều dòng)
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, nullable=False)
    
    # Phân loại kho: 'central_kitchen' (bếp trung tâm) hoặc 'store' (cửa hàng)
    location_type = db.Column(db.String(50), nullable=False)
    
    # ID của cửa hàng, nếu location_type = 'central_kitchen' thì để null
    store_id = db.Column(db.String(50), nullable=True)
    
    quantity = db.Column(db.Integer, default=0)