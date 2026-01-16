import { Types } from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@raymanselltickets/common';
import { natsWrapper } from '../../../nats-wrapper.js';
import { OrderCreatedListener } from '../order-created-listener.js';
import { JsMsg } from '@nats-io/jetstream';
import { Order } from '../../../models/order.js';

const setup = async () => {
  const listener = new OrderCreatedListener(
    natsWrapper.jsManager,
    natsWrapper.jsClient
  );

  const data: OrderCreatedEvent['data'] = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: new Date().toISOString(),
    userId: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: new Types.ObjectId().toHexString(),
      price: 10,
    },
  };

  // @ts-ignore
  const msg: JsMsg = {
    ack: vitest.fn(),
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
