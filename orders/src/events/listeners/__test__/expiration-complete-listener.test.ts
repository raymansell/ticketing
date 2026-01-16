import { Types } from 'mongoose';
import { ExpirationCompleteListener } from '../expiration-complete-listener.js';
import { natsWrapper } from '../../../nats-wrapper.js';
import { Ticket } from '../../../models/ticket.js';
import { Order, OrderStatus } from '../../../models/order.js';
import { ExpirationCompleteEvent } from '@raymanselltickets/common';
import { JsMsg } from '@nats-io/jetstream';

const setup = async () => {
  const listener = new ExpirationCompleteListener(
    natsWrapper.jsManager,
    natsWrapper.jsClient
  );

  const ticket = new Ticket({
    _id: new Types.ObjectId(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const order = new Order({
    userId: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order._id.toString(),
  };
  // @ts-ignore
  const msg: JsMsg = {
    ack: vitest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it('updates the order status to `cancelled`', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.jsClient.publish).toHaveBeenCalled();

  const orderCancelledEventData = JSON.parse(
    // @ts-ignore
    natsWrapper.jsClient.publish.mock.calls[0][1]
  );

  expect(orderCancelledEventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
