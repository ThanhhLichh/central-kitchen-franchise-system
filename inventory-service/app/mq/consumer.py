import pika
import json
import os
import time

from app.services.inventory_service import export_stock
from app.main import create_app

app = create_app()


def callback(ch, method, properties, body):
    print("📩 Received:", body)

    try:
        data = json.loads(body)

        if "items" not in data:
            raise ValueError("Invalid message")

        with app.app_context():
            result = export_stock(data["items"])

        print("⚙️ Result:", result)

        # 🔥 tránh retry vô hạn
        if isinstance(result, tuple):
            print("❌ Error → ACK to stop retry")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        if result.get("success"):
            print("✅ ACK")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            print("❌ Business error → ACK")
            ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print("🔥 ERROR:", str(e))
        ch.basic_ack(delivery_tag=method.delivery_tag)  # ❗ không retry


def start_consumer():
    host = os.getenv("RABBITMQ_HOST", "rabbitmq")

    while True:
        try:
            print("🔄 Connecting to RabbitMQ...")

            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=host)
            )

            print("✅ Connected to RabbitMQ")

            channel = connection.channel()

            channel.queue_declare(queue='inventory_queue')

            print("🚀 Waiting for messages...")

            channel.basic_qos(prefetch_count=1)

            channel.basic_consume(
                queue='inventory_queue',
                on_message_callback=callback,
                auto_ack=False
            )

            channel.start_consuming()

        except Exception as e:
            print("❌ Retry RabbitMQ:", str(e))
            time.sleep(3)