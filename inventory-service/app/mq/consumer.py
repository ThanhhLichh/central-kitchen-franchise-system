import time
import pika
import json
import os

from app.services.inventory_service import export_stock

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")


def start_consumer(app):
    while True:
        connection = None

        try:
            print("Connecting to RabbitMQ...", flush=True)

            time.sleep(2)

            parameters = pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                heartbeat=600,
                blocked_connection_timeout=300,
                connection_attempts=5,
                retry_delay=5
            )

            connection = pika.BlockingConnection(parameters)

            print("Connected to RabbitMQ", flush=True)

            channel = connection.channel()

            channel.queue_declare(queue='inventory_queue', durable=True)
            channel.basic_qos(prefetch_count=1)

            def callback(ch, method, properties, body):
                print("Received:", body, flush=True)

                try:
                    data = json.loads(body)

                    with app.app_context():
                        result = export_stock(data['items'])

                    print("Exported:", result, flush=True)

                    if result.get("success"):
                        ch.basic_ack(delivery_tag=method.delivery_tag)
                    else:
                        print("Business failed", flush=True)
                        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

                except Exception as e:
                    print("Error:", e, flush=True)
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

            channel.basic_consume(
                queue='inventory_queue',
                on_message_callback=callback,
                auto_ack=False
            )

            print("Waiting for messages...", flush=True)
            channel.start_consuming()

        except Exception as e:
            print("Consumer crashed, retrying...", e, flush=True)
            time.sleep(5)

        finally:
            if connection:
                try:
                    connection.close()
                except:
                    pass


if __name__ == "__main__":
    from app.main import create_app
    app = create_app()
    start_consumer(app)