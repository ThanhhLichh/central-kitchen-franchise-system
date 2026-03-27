from app.main import create_app
from app.mq.consumer import start_consumer
import threading

app = create_app()

# chạy RabbitMQ consumer song song Flask
threading.Thread(target=start_consumer, daemon=True).start()

if __name__ == "__main__":
    app.run(debug=True, port=5003)