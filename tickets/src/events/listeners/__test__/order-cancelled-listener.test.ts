import mongoose from 'mongoose';
import { OrderCancelledEvent } from '@raymanselltickets/common';
import { Ticket } from '../../../models/ticket.js';
import { natsWrapper } from '../../../nats-wrapper.js';
import { OrderCancelledListener } from '../order-cancelled-listener.js';
import { JsMsg } from '@nats-io/jetstream';

const setup = async () => {
  const listener = new OrderCancelledListener(
    natsWrapper.jsManager,
    natsWrapper.jsClient
  );

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = new Ticket({
    title: 'concert',
    price: 50,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket._id.toString(),
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: JsMsg = {
    ack: vitest.fn(),
  };

  return { listener, ticket, data, msg, orderId };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.jsClient.publish).toHaveBeenCalled();
});
