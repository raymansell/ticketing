import { Types } from 'mongoose';
import { JsMsg } from '@nats-io/jetstream';
import { TicketUpdatedEvent } from '@raymanselltickets/common';
import { natsWrapper } from '../../../nats-wrapper.js';
import { TicketUpdatedListener } from '../ticket-updated-listener.js';
import { Ticket } from '../../../models/ticket.js';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(
    natsWrapper.jsManager,
    natsWrapper.jsClient
  );

  // create and save a ticket
  const ticket = new Ticket({
    _id: new Types.ObjectId(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 42,
    userId: new Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: JsMsg = {
    ack: vitest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('finds, updates, and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener, ticket } = await setup();

  data.version = data.version + 10;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
