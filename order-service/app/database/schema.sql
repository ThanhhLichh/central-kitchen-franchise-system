CREATE DATABASE IF NOT EXISTS order_db;
USE order_db;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT
);