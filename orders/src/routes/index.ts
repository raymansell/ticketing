import express, { Request, Response } from 'express';
import { requireAuth } from '@raymanselltickets/common';
import { Order, OrderDoc } from '../models/order.js';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find<OrderDoc>({
    userId: req.currentUser!.id,
  }).populate('ticket');
  res.send(orders);
});

export { router as indexOrderRouter };
