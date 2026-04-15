from fastapi import FastAPI

from app.database.db import engine
from app.models.base import Base
from app.models.order import Order, OrderItem
from app.routes.order_routes import router as order_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Order Service")

app.include_router(order_router)


@app.get("/")
def root():
    return {"message": "Order Service is running"}