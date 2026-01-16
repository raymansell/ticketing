import {
  ExpirationCompleteEvent,
  Listener,
  Subjects,
  OrderStatus,
} from '@raymanselltickets/common';
import { queueGroupName } from './queue-group-name.js';
import { JsMsg } from '@nats-io/jetstream';
import { Order, OrderDoc } from '../../models/order.js';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher.js';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(
    data: ExpirationCompleteEvent['data'],
    msg: JsMsg
  ): Promise<void> {
    const order = await Order.findById<OrderDoc>(data.orderId).populate(
      'ticket'
    );

    if (!order) {
      throw new Error('Order not found');
    }

    // do not expire/cancell orders that have already been paid!
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    await new OrderCancelledPublisher(this.jsClient).publish({
      id: order._id.toString(),
      version: order.version,
      ticket: {
        id: order.ticket._id.toString(),
      },
    });

    msg.ack();
  }
}
