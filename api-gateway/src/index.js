require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const axios = require('axios');

const app = express();

const PORT = process.env.GATEWAY_PORT || 3000;
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || 'http://localhost:4001';

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Proxy: create order
app.post('/api/orders', async (req, res) => {
  try {
    const response = await axios.post(`${ORDERS_SERVICE_URL}/orders`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Error proxying to orders-service', err.message);
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ message: 'Orders service unavailable' });
    }
  }
});

// Proxy: list orders
app.get('/api/orders', async (_req, res) => {
  try {
    const response = await axios.get(`${ORDERS_SERVICE_URL}/orders`);
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Error proxying to orders-service', err.message);
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ message: 'Orders service unavailable' });
    }
  }
});

// Proxy: get order by id
app.get('/api/orders/:id', async (req, res) => {
  try {
    const response = await axios.get(`${ORDERS_SERVICE_URL}/orders/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Error proxying to orders-service', err.message);
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ message: 'Orders service unavailable' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
  console.log(`Forwarding /api/orders to ${ORDERS_SERVICE_URL}`);
});
