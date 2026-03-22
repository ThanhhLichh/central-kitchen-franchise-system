from app.database.db import get_db_connection

def handle_create_order(order):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        
        cursor.execute(
            "INSERT INTO orders (store_id, status) VALUES (%s, %s)",
            (order["store_id"], "processing")
        )
        order_id = cursor.lastrowid

        
        for item in order["items"]:
            cursor.execute(
                "INSERT INTO order_items (order_id, product_id, quantity) VALUES (%s, %s, %s)",
                (order_id, item["product_id"], item["quantity"])
            )

        conn.commit()

        return {
            "order_id": order_id,
            "status": "processing"
        }

    except Exception as e:
        conn.rollback()  
        raise e         

    finally:
        cursor.close()
        conn.close()