import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import {
  validateRequest,
  requireAuth,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
} from '@raymanselltickets/common';
import { Ticket } from '../models/ticket.js';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher.js';
import { natsWrapper } from '../nats-wrapper.js';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  [
    param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
    body('title').not().isEmpty().withMessage('Title id required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();

    /* await */ new TicketUpdatedPublisher(natsWrapper.jsClient).publish({
      id: ticket._id.toString(),
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
