from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import engine
from app.models.base import Base
from app.models.delivery import Delivery
from app.routes.delivery_routes import router as delivery_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Delivery Service",
    description="Quản lý giao hàng - Central Kitchen Franchise System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(delivery_router)


@app.get("/")
def root():
    return {"message": "Delivery Service is running", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}
