import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@raymanselltickets/common';
import { stripe } from '../stripe.js';
import { natsWrapper } from '../nats-wrapper.js';
import { Order, OrderDoc } from '../models/order.js';
import { Payment } from '../models/payment.js';
import { PaymentCreatedPublisher } from '../events/publihsers/payment-created-publisher.js';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById<OrderDoc>(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = new Payment({ orderId, stripeId: charge.id });
    await payment.save();

    /*await*/ new PaymentCreatedPublisher(natsWrapper.jsClient).publish({
      id: payment._id.toString(),
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
