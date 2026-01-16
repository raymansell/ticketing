import mongoose from 'mongoose';
import { app } from './app.js';
import { natsWrapper } from './nats-wrapper.js';
import { OrderCreatedListener } from './events/listeners/order-created-listener.js';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener.js';
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLIENT_NAME) {
    throw new Error('NATS_CLIENT_NAME must be defined');
  }
  if (!process.env.NATS_STREAM_NAME) {
    throw new Error('NATS_STREAM_NAME must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLIENT_NAME,
      process.env.NATS_URL,
      process.env.NATS_STREAM_NAME
    );
    natsWrapper.connection.closed().then((err) => {
      console.log(
        `NATS connection closed ${err ? ' with error: ' + err.message : ''}`
      );
      process.exit(0); // recall the tsx watch mode caveat (see one_offs/tsx-caveat.js)
    });
    process.on('SIGINT', async () => {
      await natsWrapper.connection.close();
    });
    process.on('SIGTERM', async () => {
      await natsWrapper.connection.close();
    });

    new OrderCreatedListener(
      natsWrapper.jsManager,
      natsWrapper.jsClient
    ).listen();

    new OrderCancelledListener(
      natsWrapper.jsManager,
      natsWrapper.jsClient
    ).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log('listening on 3000');
  });
};

start();
