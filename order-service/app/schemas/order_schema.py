from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel, Field, ConfigDict


class OrderStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"


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


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: str
    created_by: str | None = None
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemResponse]


class OrderCreateResponse(BaseModel):
    order_id: int
    status: OrderStatus


class OrderStatusUpdate(BaseModel):
    status: OrderStatus