from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import engine
from app.models.base import Base
from app.models.order import Order, OrderItem
from app.routes.order_routes import router as order_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Order Service")

# Cấu hình CORS
origins = [
    "http://localhost:5173",   # React dev
    "http://127.0.0.1:5173",
    # thêm domain frontend nếu có
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # hoặc ["*"] nếu muốn mở hết (dev thôi)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(order_router)

@app.get("/")
def root():
    return {"message": "Order Service is running"}