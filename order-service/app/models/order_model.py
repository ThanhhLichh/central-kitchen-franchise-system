from pydantic import BaseModel
from typing import List

class Item(BaseModel):
    product_id: int
    quantity: int

class Order(BaseModel):
    store_id: int
    items: List[Item]