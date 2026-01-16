import request from 'supertest';
import { app } from '../../app.js';
import { Ticket } from '../../models/ticket.js';
import { Types } from 'mongoose';

it('fetches the order', async () => {
  // Create a ticket
  const ticket = new Ticket({
    _id: new Types.ObjectId(),
    title: 'concert',
    price: 50,
  });
  await ticket.save();

  const user = global.signin();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket._id.toString() })
    .expect(201);

  // make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
  // Create a ticket
  const ticket = new Ticket({
    _id: new Types.ObjectId(),
    title: 'concert',
    price: 50,
  });
  await ticket.save();

  const user = global.signin();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket._id.toString() })
    .expect(201);

  // make a request to fetch the order (as another user)
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});
