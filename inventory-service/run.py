from app.main import create_app
import threading
from app.mq.consumer import start_consumer

app = create_app()

threading.Thread(target=start_consumer, daemon=True).start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)