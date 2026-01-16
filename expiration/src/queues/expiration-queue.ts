import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher.js';
import { natsWrapper } from '../nats-wrapper.js';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  // preventing `Complete` (paid) orders from being marked as `Cancelled` is done in the ExpirationCompleteListener.
  new ExpirationCompletePublisher(natsWrapper.jsClient).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
