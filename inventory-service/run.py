import os
import threading
from app.main import create_app
from app.mq.consumer import start_consumer

app = create_app()

if __name__ == "__main__":
    if os.getenv("WERZEUG_RUN_MAIN") == "true":
        t = threading.Thread(target=start_consumer)
        t.daemon = True
        t.start()
    app.run(host="0.0.0.0", port=5000, debug=True)