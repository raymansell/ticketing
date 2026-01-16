import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  OrderStatus,
} from '@raymanselltickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket, TicketDoc } from '../models/ticket.js';
import { Order } from '../models/order.js';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher.js';
import { natsWrapper } from '../nats-wrapper.js';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .isMongoId()
      .withMessage('ticketId must be a valid MongoDB ObjectId'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById<TicketDoc>(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = new Order({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.jsClient).publish({
      version: order.version,
      id: order._id.toString(),
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket._id.toString(),
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
