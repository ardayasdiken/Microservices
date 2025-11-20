require('dotenv').config();
const { consumeOrderCreated } = require('./rabbitmq/consumer');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function bootstrap() {
  console.log('[payments-service] Starting...');
  await consumeOrderCreated(RABBITMQ_URL);
}

bootstrap().catch((err) => {
  console.error('Failed to start payments-service', err);
  process.exit(1);
});
