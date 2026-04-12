import pika
import json
import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")


def publish_order(items):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST)
    )

    channel = connection.channel()

    channel.queue_declare(queue='inventory_queue')

    message = {
        "items": items
    }

    channel.basic_publish(
        exchange='',
        routing_key='inventory_queue',
        body=json.dumps(message)
    )

    print("Sent to inventory:", message)

    connection.close()