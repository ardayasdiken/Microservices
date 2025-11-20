const amqplib = require('amqplib');

const EXCHANGE_NAME = 'orders';
const ROUTING_KEY = 'order.created';

async function createOrderPublisher(rabbitUrl) {
  const connection = await amqplib.connect(rabbitUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

  console.log('[orders-service] RabbitMQ publisher initialized');

  async function publishOrderCreated(payload) {
    const message = Buffer.from(JSON.stringify(payload));
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, message, {
      contentType: 'application/json',
      persistent: true
    });
    console.log('[orders-service] Published order.created event', payload);
  }

  return {
    publishOrderCreated
  };
}

module.exports = { createOrderPublisher };
