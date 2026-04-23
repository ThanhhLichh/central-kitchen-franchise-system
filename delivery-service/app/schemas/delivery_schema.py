from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DeliveryStatus(str, Enum):
    pending = "pending"
    shipping = "shipping"
    delivered = "delivered"


# ---------- Request schemas ----------

class DeliveryCreate(BaseModel):
    order_id: int
    delivery_date: Optional[date] = None


class DeliveryUpdate(BaseModel):
    delivery_date: date


class DeliveryStatusUpdate(BaseModel):
    status: DeliveryStatus


# ---------- Response schemas ----------

class DeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    status: DeliveryStatus
    delivery_date: Optional[date]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class DeliveryCreateResponse(BaseModel):
    delivery_id: int
    order_id: int
    status: DeliveryStatus