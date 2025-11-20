# Microservices Architecture

This repository demonstrates a clean, production-style microservices architecture using Node.js:

- **API Gateway** (`api-gateway`)
- **Orders Service** (`orders-service`)
- **Payments Service** (`payments-service`)
- **RabbitMQ** for asynchronous communication

## High-level design

- Clients talk only to the **API Gateway**.
- The **Orders Service** is responsible for order creation and querying.
- Each new order emits an `order.created` event to RabbitMQ.
- The **Payments Service** consumes `order.created` events and simulates payment processing.

## Running with Docker

Requirements:

- Docker
- docker-compose

```bash
docker-compose up --build
```

Once everything is up:

- API Gateway: http://localhost:3000
- RabbitMQ Management UI: http://localhost:15672 (user: `guest`, pass: `guest`)

### Create an order

```bash
curl -X POST http://localhost:3000/api/orders \

  -H "Content-Type: application/json" \

  -d '{
    "customerId": "user-123",
    "totalAmount": 149.99,
    "items": [
      { "sku": "P001", "quantity": 1 },
      { "sku": "P002", "quantity": 2 }
    ]
  }'
```

### Get all orders

```bash
curl http://localhost:3000/api/orders
```

The Payments service logs will show payment processing triggered by events.
