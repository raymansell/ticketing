import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  NotAuthorizedError,
  NotFoundError,
} from '@raymanselltickets/common';
import { Order, OrderDoc } from '../models/order.js';

const router = express.Router();

router.get(
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

    res.send(order);
  }
);

export { router as showOrderRouter };
