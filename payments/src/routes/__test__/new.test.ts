import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../app.js';
import { stripe } from '../../stripe.js';
import { Order, OrderStatus } from '../../models/order.js';
import { Payment, PaymentDoc } from '../../models/payment.js';
import { Mock } from 'vitest';

// vitest.mock('../../stripe.js');

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'stripe-token',
      orderId: new Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = new Order({
    _id: new Types.ObjectId(),
    price: 42,
    status: OrderStatus.Created,
    userId: new Types.ObjectId().toHexString(), // this is a user
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin()) // this is  the different user
    .send({
      token: 'stripe-token',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = new Types.ObjectId().toHexString();
  const order = new Order({
    _id: new Types.ObjectId(),
    price: 42,
    status: OrderStatus.Cancelled,
    userId,
  });
  await order.save();

  await request(app)
    .post(`/api/payments`)
    .set('Cookie', global.signin(userId))
    .send({ token: 'stripe-token', orderId: order.id })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = new Order({
    _id: new Types.ObjectId(),
    price,
    status: OrderStatus.Created,
    userId,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  /*
  // testing with a stripe client mock
  const chargeOptions = (stripe.charges.create as Mock).mock.calls[0][0];

  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual('usd');
  */

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripcheCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  expect(stripcheCharge).toBeDefined();
  expect(stripcheCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne<PaymentDoc>({
    orderId: order.id,
    stripeId: stripcheCharge!.id,
  });
  expect(payment).not.toBeNull();
});
