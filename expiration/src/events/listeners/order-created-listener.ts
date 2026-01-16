import { JsMsg } from '@nats-io/jetstream';
import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@raymanselltickets/common';
import { queueGroupName } from './queueGroupName.js';
import { expirationQueue } from '../../queues/expiration-queue.js';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );

    msg.ack();
  }
}
