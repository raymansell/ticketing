import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app.js';
import { Order, OrderStatus } from '../../models/order.js';
import { Ticket } from '../../models/ticket.js';
import { natsWrapper } from '../../nats-wrapper.js';

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = new Ticket({
    _id: new Types.ObjectId(),
    title: 'concert',
    price: 50,
  });
  await ticket.save();

  const order = new Order({
    ticket,
    userId: 'random_id',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ tickeId: ticket._id.toString() })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = new Ticket({
    _id: new Types.ObjectId(),
    title: 'concert',
    price: 50,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket._id.toString() })
    .expect(201);
});

it('emits an order created event', async () => {
  const ticket = new Ticket({
    _id: new Types.ObjectId(),
    title: 'concert',
    price: 50,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket._id.toString() })
    .expect(201);

  expect(natsWrapper.jsClient.publish).toHaveBeenCalled();
});
