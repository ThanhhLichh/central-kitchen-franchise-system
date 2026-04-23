from app.config.db import db
from datetime import datetime

class StockMovement(db.Model):
    __tablename__ = "stock_movements"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer)
    change = db.Column(db.Integer)
    type = db.Column(db.String(20)) # Ví dụ: 'import' (nhập kho), 'export' (xuất kho)
    
    # Phân loại kho thực hiện giao dịch: 'central_kitchen' hoặc 'store'
    location_type = db.Column(db.String(50), nullable=False)
    
    # ID của cửa hàng thực hiện giao dịch, null nếu là bếp trung tâm
    store_id = db.Column(db.String(50), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)