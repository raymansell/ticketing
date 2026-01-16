import { JsMsg } from '@nats-io/jetstream';
import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@raymanselltickets/common';
import { Types } from 'mongoose';
import { queueGroupName } from './queue-group-name.js';
import { Order } from '../../models/order.js';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
    const {
      id,
      status,
      userId,
      ticket: { price },
    } = data;
    const order = new Order({
      _id: new Types.ObjectId(id),
      price,
      status,
      userId,
    });
    await order.save();

    msg.ack();
  }
}
