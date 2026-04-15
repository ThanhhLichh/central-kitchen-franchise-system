import threading
import time
from app.main import create_app
from app.mq.consumer import start_consumer

app = create_app()


def run_consumer():
    while True:
        try:
            start_consumer(app)
        except Exception as e:
            print("Consumer crashed:", e, flush=True)
            time.sleep(5)


if __name__ == "__main__":
    t = threading.Thread(
        target=run_consumer,
        daemon=True,
        name="inventory-consumer"
    )
    t.start()

    app.run(host="0.0.0.0", port=5000, debug=False)