import { Types } from 'mongoose';
import { JsMsg } from '@nats-io/jetstream';
import { OrderCancelledEvent, OrderStatus } from '@raymanselltickets/common';
import { natsWrapper } from '../../../nats-wrapper.js';
import { Order } from '../../../models/order.js';
import { OrderCancelledListener } from '../order-cancelled-listener.js';

const setup = async () => {
  const listener = new OrderCancelledListener(
    natsWrapper.jsManager,
    natsWrapper.jsClient
  );

  const order = new Order({
    _id: new Types.ObjectId(),
    status: OrderStatus.Created,
    price: 10,
    userId: new Types.ObjectId().toHexString(),
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: new Types.ObjectId().toHexString(),
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: JsMsg = {
    ack: vitest.fn(),
  };

  return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
