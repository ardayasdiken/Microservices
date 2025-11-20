require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { createOrderPublisher } = require('./rabbitmq/publisher');
const { randomUUID } = require('crypto');

const PORT = process.env.SERVICE_PORT || 4001;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function bootstrap() {
  const app = express();
  app.use(express.json());
  app.use(morgan('dev'));

  const orders = new Map(); // in-memory store for demo
  const publisher = await createOrderPublisher(RABBITMQ_URL);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'orders-service' });
  });

  app.post('/orders', async (req, res) => {
    try {
      const { customerId, totalAmount, items } = req.body;
      if (!customerId || !totalAmount || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Invalid payload' });
      }

      const id = randomUUID();
      const order = {
        id,
        customerId,
        totalAmount,
        items,
        status: 'CREATED',
        createdAt: new Date().toISOString()
      };

      orders.set(id, order);

      await publisher.publishOrderCreated({
        orderId: order.id,
        customerId: order.customerId,
        totalAmount: order.totalAmount,
        items: order.items
      });

      return res.status(201).json(order);
    } catch (err) {
      console.error('Failed to create order', err);
      return res.status(500).json({ message: 'Failed to create order' });
    }
  });

  app.get('/orders', (_req, res) => {
    res.json(Array.from(orders.values()));
  });

  app.get('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  });

  app.listen(PORT, () => {
    console.log(`Orders service listening on port ${PORT}`);
    console.log(`Connected to RabbitMQ at ${RABBITMQ_URL}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start orders-service', err);
  process.exit(1);
});
