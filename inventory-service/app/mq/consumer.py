import pika
import json
import os

from app.services.inventory_service import export_stock
from app.main import create_app

app = create_app()

def callback(ch, method, properties, body):
    print("Received:", body)

    try:
        data = json.loads(body)

        with app.app_context():
            result = export_stock(data["items"])

        print("Result:", result)

        if result["success"]:
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            print("Business error → retry")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    except Exception as e:
        print("ERROR:", str(e))
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def start_consumer():
    host = os.getenv("RABBITMQ_HOST", "localhost")

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=host)
    )

    channel = connection.channel()

    channel.queue_declare(queue='inventory_queue')

    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(
        queue='inventory_queue',
        on_message_callback=callback,
        auto_ack=False
    )

    print("Inventory is waiting for messages...")

    channel.start_consuming()