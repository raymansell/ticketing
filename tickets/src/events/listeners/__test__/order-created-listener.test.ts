import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@raymanselltickets/common';
import { natsWrapper } from '../../../nats-wrapper.js';
import { OrderCreatedListener } from '../order-created-listener.js';
import { Ticket } from '../../../models/ticket.js';
import { JsMsg } from '@nats-io/jetstream';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(
    natsWrapper.jsManager,
    natsWrapper.jsClient
  );

  // Create and save a ticket
  const ticket = new Ticket({
    title: 'concert',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'timestamp',
    ticket: {
      id: ticket._id.toString(),
      price: ticket.price,
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: JsMsg = {
    ack: vitest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // refetch the ticket now that the onMessage handler updated it
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.jsClient.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    // @ts-ignore
    natsWrapper.jsClient.publish.mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
