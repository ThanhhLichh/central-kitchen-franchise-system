import asyncio
import json
import os

import aio_pika

from app.database.db import AsyncSessionLocal
from app.models.delivery import Delivery

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
QUEUE_NAME = "delivery_queue"


async def handle_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            body = json.loads(message.body.decode())
            order_id = body.get("order_id")

            if not order_id:
                print(f"[Consumer] Thiếu order_id trong message: {body}")
                return

            async with AsyncSessionLocal() as db:
                new_delivery = Delivery(
                    order_id=order_id,
                    status="pending",
                )
                db.add(new_delivery)
                await db.commit()
                await db.refresh(new_delivery)

            print(f"[Consumer] Đã tạo delivery #{new_delivery.id} cho order #{order_id}")

        except Exception as e:
            print(f"[Consumer] Lỗi xử lý message: {e}")


async def start_consumer():
    # Thử kết nối lại nếu RabbitMQ chưa sẵn sàng
    while True:
        try:
            connection = await aio_pika.connect_robust(
                host=RABBITMQ_HOST,
                port=5672,
            )
            channel = await connection.channel()
            queue = await channel.declare_queue(QUEUE_NAME, durable=True)
            await queue.consume(handle_message)
            print(f"[Consumer] Đang lắng nghe queue: {QUEUE_NAME}")
            return connection
        except Exception as e:
            print(f"[Consumer] RabbitMQ chưa sẵn sàng, thử lại sau 5s... ({e})")
            await asyncio.sleep(5)