from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import engine
from app.models.base import Base
from app.routes.delivery_routes import router as delivery_router
from app.mq.consumer import start_consumer


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Khởi tạo bảng trong database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Khởi động RabbitMQ consumer
    connection = await start_consumer()

    yield

    # 3. Tắt server: đóng kết nối
    await connection.close()
    await engine.dispose()


app = FastAPI(
    title="Delivery Service",
    description="Quản lý giao hàng - Central Kitchen Franchise System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(delivery_router)


@app.get("/")
async def root():
    return {"message": "Delivery Service is running", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}