import pika
import json
import os

from app.services.inventory_service import export_stock
from app.main import create_app

app = create_app()

RABBITMQ_HOST = os.getenv("RabbitMQ_HOST", "rabbitmq")

def callback(ch, method, properties, body):
    print("Received: ", body)

    try:
        data = json.loads(body)

        with app.app_context():
            result = export_stock(data['items'])
        
        print("Exported stock: ", result)

        if result["success"]:
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            print("Business logic failed, not acknowledging message.")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    except Exception as e:
        print("Error processing message: ", e)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    
def start_consumer():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST)
    )

    channel = connection.channel()

    channel.queue_declare(queue='inventory_queue', durable=False)

    channel.basic_consume(
        queue='inventory_queue',
        on_message_callback=callback,
        auto_ack=False
    )

    print("Waiting for messages...")
    channel.start_consuming()


if __name__ == "__main__":
    start_consumer()