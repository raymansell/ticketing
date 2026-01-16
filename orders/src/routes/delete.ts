import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  NotAuthorizedError,
  NotFoundError,
} from '@raymanselltickets/common';
import { Order, OrderDoc, OrderStatus } from '../models/order.js';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher.js';
import { natsWrapper } from '../nats-wrapper.js';

const router = express.Router();

// 'order' resources are never deleted, instead they are soft deleted by marking its status as `Cancelled`
router.delete(
  '/api/orders/:orderId',
  requireAuth,
  param('orderId')
    .isMongoId()
    .withMessage('orderId must be a valid MongoDB ObjectId'),
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById<OrderDoc>(req.params.orderId).populate(
      'ticket'
    );

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publish an event saying this was cancelled!
    new OrderCancelledPublisher(natsWrapper.jsClient).publish({
      version: order.version,
      id: order._id.toJSON(),
      ticket: {
        id: order.ticket._id.toJSON(),
      },
    });

    res.send(order);
  }
);

export { router as deleteOrderRouter };
