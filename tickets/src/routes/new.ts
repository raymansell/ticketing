import { requireAuth, validateRequest } from '@raymanselltickets/common';
import { body } from 'express-validator';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket.js';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher.js';
import { natsWrapper } from '../nats-wrapper.js';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = new Ticket({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.jsClient).publish({
      id: ticket._id.toString(),
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
