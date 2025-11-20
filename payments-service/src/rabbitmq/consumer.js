const amqplib = require('amqplib');

const EXCHANGE_NAME = 'orders';
const ROUTING_KEY = 'order.created';
const QUEUE_NAME = 'payments.order.created';

async function consumeOrderCreated(rabbitUrl) {
  const connection = await amqplib.connect(rabbitUrl);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
  const { queue } = await channel.assertQueue(QUEUE_NAME, {
    durable: true
  });

  await channel.bindQueue(queue, EXCHANGE_NAME, ROUTING_KEY);

  console.log(`[payments-service] Waiting for ${ROUTING_KEY} events in queue ${queue}`);

  channel.consume(
    queue,
    async (msg) => {
      if (!msg) return;

      const content = msg.content.toString();
      let data;
      try {
        data = JSON.parse(content);
      } catch (err) {
        console.error('[payments-service] Failed to parse message', err);
        channel.nack(msg, false, false);
        return;
      }

      console.log('[payments-service] Processing payment for order:', data);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`[payments-service] Payment SUCCESS for order ${data.orderId}, amount=${data.totalAmount}`);

      channel.ack(msg);
    },
    { noAck: false }
  );
}

module.exports = { consumeOrderCreated };
