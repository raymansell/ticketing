import { JsMsg } from '@nats-io/jetstream';
import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from '@raymanselltickets/common';
import { queueGroupName } from './queue-group-name.js';
import { Order, OrderDoc } from '../../models/order.js';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: JsMsg) {
    // we use findOne instead of findById to
    // future proof potential OrderUpdatedEvents
    const order = await Order.findOne<OrderDoc>({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
