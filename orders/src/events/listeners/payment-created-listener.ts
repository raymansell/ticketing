import {
  Listener,
  PaymentCreatedEvent,
  Subjects,
  OrderStatus,
} from '@raymanselltickets/common';
import { JsMsg } from '@nats-io/jetstream';
import { queueGroupName } from './queue-group-name.js';
import { Order, OrderDoc } from '../../models/order.js';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: JsMsg) {
    const order = await Order.findById<OrderDoc>(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    // we may want to emit an additional event given that we changed the status of the order, which in turn updated its `version`.
    // https://globant.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19826522 @4:55
    // more specifically, we should likely handle these updates in the payment service just to mark the order there as `Complete`, otherwise we are allowing payments to be processed twice for the same order in the payments service

    msg.ack();
  }
}
