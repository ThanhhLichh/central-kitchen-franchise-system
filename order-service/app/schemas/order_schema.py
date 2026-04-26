from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel, Field, ConfigDict


class OrderStatus(str, Enum):
    pending = "pending"
    waiting_production = "waiting_production"
    processing = "processing"
    completed = "completed"
    cancelled = "cancelled"


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int


class MissingItemResponse(BaseModel):
    product_id: int
    missing_quantity: int


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: str
    created_by: str | None = None
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemResponse]
    missing_items: List[MissingItemResponse] = []


class OrderCreateResponse(BaseModel):
    order_id: int
    status: OrderStatus
    missing_items: List[MissingItemResponse] = []


class OrderStatusUpdate(BaseModel):
    status: OrderStatus