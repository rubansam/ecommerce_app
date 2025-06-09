# Database Schema

## Overview

This schema supports the e-commerce platform described in the PRD. It is normalized, indexed for performance, and designed for PostgreSQL. Sequelize ORM models are provided for Node.js integration.

---

## 1. Table: users

| Column Name    | Data Type        | Constraints                        | Description                |
|----------------|------------------|------------------------------------|----------------------------|
| id             | SERIAL           | PRIMARY KEY                        | Unique user ID             |
| name           | VARCHAR(100)     | NOT NULL                           | User's full name           |
| email          | VARCHAR(255)     | NOT NULL, UNIQUE                   | User's email address       |
| password_hash  | VARCHAR(255)     | NOT NULL                           | Hashed password            |
| role           | VARCHAR(20)      | NOT NULL, DEFAULT 'shopper'        | 'shopper' or 'admin'       |
| address        | TEXT             |                                    | Shipping address           |
| created_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Account creation time      |
| updated_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Last update time           |

**Relationships:**  
- One-to-many with orders, carts, notifications.

---

## 2. Table: products

| Column Name    | Data Type        | Constraints                        | Description                |
|----------------|------------------|------------------------------------|----------------------------|
| id             | SERIAL           | PRIMARY KEY                        | Unique product ID          |
| name           | VARCHAR(150)     | NOT NULL                           | Product name               |
| description    | TEXT             |                                    | Product description        |
| price          | NUMERIC(10,2)    | NOT NULL                           | Product price              |
| stock          | INTEGER          | NOT NULL, DEFAULT 0                | Inventory count            |
| category       | VARCHAR(100)     |                                    | Product category           |
| image_url      | TEXT             |                                    | Product image URL          |
| created_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Creation time              |
| updated_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Last update time           |

**Relationships:**  
- One-to-many with cart_items, order_items.

---

## 3. Table: carts

| Column Name    | Data Type        | Constraints                        | Description                |
|----------------|------------------|------------------------------------|----------------------------|
| id             | SERIAL           | PRIMARY KEY                        | Unique cart ID             |
| user_id        | INTEGER          | NOT NULL, FOREIGN KEY (users.id)   | Owner of the cart          |
| status         | VARCHAR(20)      | NOT NULL, DEFAULT 'active'         | 'active', 'ordered', etc.  |
| created_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Creation time              |
| updated_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Last update time           |

**Relationships:**  
- One-to-many with cart_items.
- Many-to-one with users.

---

## 4. Table: cart_items

| Column Name    | Data Type        | Constraints                        | Description                |
|----------------|------------------|------------------------------------|----------------------------|
| id             | SERIAL           | PRIMARY KEY                        | Unique cart item ID        |
| cart_id        | INTEGER          | NOT NULL, FOREIGN KEY (carts.id)   | Associated cart            |
| product_id     | INTEGER          | NOT NULL, FOREIGN KEY (products.id)| Product in the cart        |
| quantity       | INTEGER          | NOT NULL, DEFAULT 1                | Quantity of product        |

**Relationships:**  
- Many-to-one with carts, products.

---

## 5. Table: orders

| Column Name    | Data Type        | Constraints                        | Description                |
|----------------|------------------|------------------------------------|----------------------------|
| id             | SERIAL           | PRIMARY KEY                        | Unique order ID            |
| user_id        | INTEGER          | NOT NULL, FOREIGN KEY (users.id)   | User who placed the order  |
| total          | NUMERIC(10,2)    | NOT NULL                           | Total order amount         |
| status         | VARCHAR(30)      | NOT NULL, DEFAULT 'pending'        | Order status               |
| payment_id     | INTEGER          | FOREIGN KEY (payments.id)          | Associated payment         |
| created_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Order creation time        |
| updated_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Last update time           |

**Relationships:**  
- One-to-many with order_items.
- Many-to-one with users, payments.

---

## 6. Table: order_items

| Column Name    | Data Type        | Constraints                        | Description                |
|----------------|------------------|------------------------------------|----------------------------|
| id             | SERIAL           | PRIMARY KEY                        | Unique order item ID       |
| order_id       | INTEGER          | NOT NULL, FOREIGN KEY (orders.id)  | Associated order           |
| product_id     | INTEGER          | NOT NULL, FOREIGN KEY (products.id)| Product in the order       |
| quantity       | INTEGER          | NOT NULL, DEFAULT 1                | Quantity ordered           |
| price          | NUMERIC(10,2)    | NOT NULL                           | Price at order time        |

**Relationships:**  
- Many-to-one with orders, products.

---

## 7. Table: payments

| Column Name    | Data Type        | Constraints                        | Description                |
|----------------|------------------|------------------------------------|----------------------------|
| id             | SERIAL           | PRIMARY KEY                        | Unique payment ID          |
| order_id       | INTEGER          | NOT NULL, FOREIGN KEY (orders.id)  | Associated order           |
| amount         | NUMERIC(10,2)    | NOT NULL                           | Payment amount             |
| status         | VARCHAR(30)      | NOT NULL                           | Payment status             |
| method         | VARCHAR(50)      |                                    | Payment method             |
| transaction_id | VARCHAR(255)     | UNIQUE                             | External transaction ref   |
| created_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Payment time               |

**Relationships:**  
- One-to-one with orders.

---

## 8. Table: notifications

| Column Name    | Data Type        | Constraints                        | Description                |
|----------------|------------------|------------------------------------|----------------------------|
| id             | SERIAL           | PRIMARY KEY                        | Unique notification ID     |
| user_id        | INTEGER          | NOT NULL, FOREIGN KEY (users.id)   | Recipient user             |
| type           | VARCHAR(50)      | NOT NULL                           | Notification type          |
| message        | TEXT             | NOT NULL                           | Notification content       |
| read           | BOOLEAN          | NOT NULL, DEFAULT FALSE            | Read status                |
| created_at     | TIMESTAMP        | NOT NULL, DEFAULT now()            | Notification time          |

**Relationships:**  
- Many-to-one with users.

---

## Indexing Suggestions

- `users.email` (UNIQUE)
- `products.category`
- `orders.user_id`
- `cart_items.cart_id`
- `order_items.order_id`
- `notifications.user_id`

---

## Sequelize ORM Model Definitions (Example)

```js
// User
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'shopper' },
  address: { type: DataTypes.TEXT },
}, { timestamps: true });

// Product
const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  category: { type: DataTypes.STRING(100) },
  image_url: { type: DataTypes.TEXT },
}, { timestamps: true });

// Cart
const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
}, { timestamps: true });

// CartItem
const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cart_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

// Order
const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  payment_id: { type: DataTypes.INTEGER },
}, { timestamps: true });

// OrderItem
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
});

// Payment
const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false },
  method: { type: DataTypes.STRING(50) },
  transaction_id: { type: DataTypes.STRING(255), unique: true },
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

// Notification
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });
```

---

## PostgreSQL DDL Statements

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'shopper',
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payment_id INTEGER REFERENCES payments(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) NOT NULL,
  method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

---

**Note:**  
- Adjust data types and constraints as needed for your specific use case.
- Add more indexes as your query patterns evolve.
- For production, consider using UUIDs for IDs and more advanced security for sensitive data.
