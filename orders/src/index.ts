import mongoose from 'mongoose';
import { app } from './app.js';
import { natsWrapper } from './nats-wrapper.js';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener.js';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener.js';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener.js';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener.js';

const start = async () => {
  console.log('Starting up orders service...');

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
      process.env.NATS_STREAM_NAME,
    );
    natsWrapper.connection.closed().then((err) => {
      console.log(
        `NATS connection closed ${err ? ' with error: ' + err.message : ''}`,
      );
      process.exit(0); // recall the tsx watch mode caveat (see one_offs/tsx-caveat.js)
    });

    process.on('SIGINT', async () => {
      await natsWrapper.connection.close();
    });
    process.on('SIGTERM', async () => {
      await natsWrapper.connection.close();
    });

    new TicketCreatedListener(
      natsWrapper.jsManager,
      natsWrapper.jsClient,
    ).listen();

    new TicketUpdatedListener(
      natsWrapper.jsManager,
      natsWrapper.jsClient,
    ).listen();

    new ExpirationCompleteListener(
      natsWrapper.jsManager,
      natsWrapper.jsClient,
    ).listen();

    new PaymentCreatedListener(
      natsWrapper.jsManager,
      natsWrapper.jsClient,
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
