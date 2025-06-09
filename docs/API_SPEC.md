# API Specification

This document defines the REST API endpoints for the e-commerce platform, designed for an Express.js backend using Sequelize ORM.

---

## Table of Contents

- [Users](#users)
- [Authentication](#authentication)
- [Products](#products)
- [Cart](#cart)
- [Orders](#orders)
- [Payments](#payments)
- [Notifications](#notifications)

---

## Users

### Register User
- **Endpoint:** `POST /users`
- **Description:** Register a new user.
- **Authentication:** None
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "string",         // required
    "email": "string",        // required
    "password": "string"      // required
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "shopper"
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (validation error)
  - `409 Conflict` (email already exists)
- **Security Notes:** Input validation, password hashing.

---

### Get User Profile
- **Endpoint:** `GET /users/me`
- **Description:** Get the authenticated user's profile.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`
- **Success Response:** `200 OK`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "shopper",
    "address": "123 Main St"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`
- **Security Notes:** JWT validation.

---

### Update User Profile
- **Endpoint:** `PUT /users/me`
- **Description:** Update the authenticated user's profile.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "string",         // optional
    "address": "string"       // optional
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "id": 1,
    "name": "Jane Doe",
    "email": "john@example.com",
    "role": "shopper",
    "address": "456 New St"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`
  - `401 Unauthorized`
- **Security Notes:** Input validation.

---

## Authentication

### Login
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate user and return JWT.
- **Authentication:** None
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "string",        // required
    "password": "string"      // required
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "token": "jwt-token"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` (invalid credentials)
- **Security Notes:** Rate limiting, password hashing.

---

### Password Reset (Request)
- **Endpoint:** `POST /auth/password-reset`
- **Description:** Request a password reset email.
- **Authentication:** None
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "string"         // required
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "message": "Password reset email sent."
  }
  ```
- **Error Responses:**
  - `404 Not Found` (email not found)
- **Security Notes:** Do not reveal if email exists.

---

## Products

### List Products
- **Endpoint:** `GET /products`
- **Description:** Get a paginated list of products.
- **Authentication:** None
- **Query Parameters:**
  - `limit` (integer, optional, default: 20)
  - `offset` (integer, optional, default: 0)
  - `category` (string, optional)
  - `search` (string, optional)
- **Success Response:** `200 OK`
  ```json
  {
    "products": [
      {
        "id": 1,
        "name": "Product A",
        "price": 19.99,
        "stock": 10,
        "category": "Books",
        "image_url": "https://..."
      }
    ],
    "total": 100
  }
  ```
- **Error Responses:**
  - `400 Bad Request`
- **Security Notes:** Input validation, pagination.

---

### Get Product by ID
- **Endpoint:** `GET /products/:id`
- **Description:** Get details of a single product.
- **Authentication:** None
- **Path Parameters:**
  - `id` (integer, required)
- **Success Response:** `200 OK`
  ```json
  {
    "id": 1,
    "name": "Product A",
    "description": "Details...",
    "price": 19.99,
    "stock": 10,
    "category": "Books",
    "image_url": "https://..."
  }
  ```
- **Error Responses:**
  - `404 Not Found`
- **Security Notes:** Input validation.

---

### Create Product (Admin)
- **Endpoint:** `POST /products`
- **Description:** Create a new product.
- **Authentication:** JWT Required, Admin Only
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "string",         // required
    "description": "string",  // optional
    "price": 19.99,           // required
    "stock": 10,              // required
    "category": "string",     // optional
    "image_url": "string"     // optional
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "id": 2,
    "name": "Product B",
    "price": 29.99,
    "stock": 5
  }
  ```
- **Error Responses:**
  - `400 Bad Request`
  - `401 Unauthorized`
  - `403 Forbidden`
- **Security Notes:** Input validation, admin check.

---

### Update Product (Admin)
- **Endpoint:** `PUT /products/:id`
- **Description:** Update an existing product.
- **Authentication:** JWT Required, Admin Only
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Parameters:**
  - `id` (integer, required)
- **Request Body:**
  ```json
  {
    "name": "string",         // optional
    "description": "string",  // optional
    "price": 19.99,           // optional
    "stock": 10,              // optional
    "category": "string",     // optional
    "image_url": "string"     // optional
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "id": 2,
    "name": "Product B",
    "price": 29.99,
    "stock": 5
  }
  ```
- **Error Responses:**
  - `400 Bad Request`
  - `401 Unauthorized`
  - `403 Forbidden`
  - `404 Not Found`
- **Security Notes:** Input validation, admin check.

---

### Delete Product (Admin)
- **Endpoint:** `DELETE /products/:id`
- **Description:** Delete a product.
- **Authentication:** JWT Required, Admin Only
- **Request Headers:** `Authorization: Bearer <token>`
- **Path Parameters:**
  - `id` (integer, required)
- **Success Response:** `204 No Content`
- **Error Responses:**
  - `401 Unauthorized`
  - `403 Forbidden`
  - `404 Not Found`
- **Security Notes:** Admin check.

---

## Cart

### Get Current User's Cart
- **Endpoint:** `GET /cart`
- **Description:** Get the current user's active cart and items.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`
- **Success Response:** `200 OK`
  ```json
  {
    "id": 1,
    "user_id": 1,
    "status": "active",
    "items": [
      {
        "id": 1,
        "product_id": 2,
        "quantity": 3,
        "product": {
          "name": "Product B",
          "price": 29.99
        }
      }
    ]
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`
- **Security Notes:** JWT validation.

---

### Add Item to Cart
- **Endpoint:** `POST /cart/items`
- **Description:** Add a product to the current user's cart.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "product_id": 2,      // required
    "quantity": 1         // required
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "id": 1,
    "cart_id": 1,
    "product_id": 2,
    "quantity": 1
  }
  ```
- **Error Responses:**
  - `400 Bad Request`
  - `401 Unauthorized`
  - `404 Not Found` (product)
- **Security Notes:** Input validation, stock check.

---

### Update Cart Item Quantity
- **Endpoint:** `PUT /cart/items/:id`
- **Description:** Update the quantity of a cart item.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Parameters:**
  - `id` (integer, required)
- **Request Body:**
  ```json
  {
    "quantity": 2         // required
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "id": 1,
    "cart_id": 1,
    "product_id": 2,
    "quantity": 2
  }
  ```
- **Error Responses:**
  - `400 Bad Request`
  - `401 Unauthorized`
  - `404 Not Found`
- **Security Notes:** Input validation, stock check.

---

### Remove Item from Cart
- **Endpoint:** `DELETE /cart/items/:id`
- **Description:** Remove an item from the cart.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`
- **Path Parameters:**
  - `id` (integer, required)
- **Success Response:** `204 No Content`
- **Error Responses:**
  - `401 Unauthorized`
  - `404 Not Found`
- **Security Notes:** JWT validation.

---

## Orders

### Place Order
- **Endpoint:** `POST /orders`
- **Description:** Place an order from the current user's cart.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "address": "string"    // optional, overrides user address
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "id": 1,
    "user_id": 1,
    "total": 59.98,
    "status": "pending",
    "items": [
      {
        "product_id": 2,
        "quantity": 2,
        "price": 29.99
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (empty cart, stock issues)
  - `401 Unauthorized`
- **Security Notes:** Stock check, transactional integrity.

---

### List User Orders
- **Endpoint:** `GET /orders`
- **Description:** Get a list of the current user's orders.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `limit` (integer, optional, default: 20)
  - `offset` (integer, optional, default: 0)
- **Success Response:** `200 OK`
  ```json
  {
    "orders": [
      {
        "id": 1,
        "total": 59.98,
        "status": "pending",
        "created_at": "2024-06-01T12:00:00Z"
      }
    ],
    "total": 5
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`
- **Security Notes:** JWT validation.

---

### Get Order by ID
- **Endpoint:** `GET /orders/:id`
- **Description:** Get details of a specific order (must belong to user or admin).
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`
- **Path Parameters:**
  - `id` (integer, required)
- **Success Response:** `200 OK`
  ```json
  {
    "id": 1,
    "user_id": 1,
    "total": 59.98,
    "status": "pending",
    "items": [
      {
        "product_id": 2,
        "quantity": 2,
        "price": 29.99
      }
    ]
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`
  - `403 Forbidden`
  - `404 Not Found`
- **Security Notes:** Ownership check.

---

## Payments

### Create Payment for Order
- **Endpoint:** `POST /orders/:id/payments`
- **Description:** Create a payment for an order.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Path Parameters:**
  - `id` (integer, required, order ID)
- **Request Body:**
  ```json
  {
    "method": "string",         // required, e.g., "stripe"
    "payment_token": "string"   // required, from payment gateway
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "id": 1,
    "order_id": 1,
    "amount": 59.98,
    "status": "paid",
    "method": "stripe",
    "transaction_id": "ch_12345"
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (invalid payment)
  - `401 Unauthorized`
  - `404 Not Found` (order)
- **Security Notes:** Payment gateway integration, idempotency.

---

## Notifications

### List Notifications
- **Endpoint:** `GET /notifications`
- **Description:** Get a list of notifications for the current user.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `limit` (integer, optional, default: 20)
  - `offset` (integer, optional, default: 0)
- **Success Response:** `200 OK`
  ```json
  {
    "notifications": [
      {
        "id": 1,
        "type": "order_status",
        "message": "Your order has shipped.",
        "read": false,
        "created_at": "2024-06-01T12:00:00Z"
      }
    ],
    "total": 3
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`
- **Security Notes:** JWT validation.

---

### Mark Notification as Read
- **Endpoint:** `PUT /notifications/:id/read`
- **Description:** Mark a notification as read.
- **Authentication:** JWT Required
- **Request Headers:** `Authorization: Bearer <token>`
- **Path Parameters:**
  - `id` (integer, required)
- **Success Response:** `200 OK`
  ```json
  {
    "id": 1,
    "read": true
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`
  - `404 Not Found`
- **Security Notes:** Ownership check.

---

## Security Notes (General)

- All endpoints require input validation and proper error handling.
- Sensitive endpoints require JWT authentication and, where appropriate, admin authorization.
- Rate limiting should be applied to authentication and sensitive endpoints.
- All user data must be protected according to best security practices (e.g., password hashing, HTTPS, CSRF/XSS protection).

---