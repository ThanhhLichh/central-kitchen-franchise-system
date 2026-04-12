from sqlalchemy import Column, DateTime, Integer, String, Date
from sqlalchemy.sql import func

from app.models.base import Base


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="pending")
    delivery_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
