from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import engine
from app.models.base import Base
from app.routes.delivery_routes import router as delivery_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Lúc khởi động server: Khởi tạo bảng trong database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    yield  # Ứng dụng hoạt động và nhận request ở bước này...
    
    # 2. Lúc tắt server hoặc Uvicorn reload: Đóng mọi kết nối database an toàn
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