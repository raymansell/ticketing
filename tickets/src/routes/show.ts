import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { Ticket } from '../models/ticket.js';
import { NotFoundError, validateRequest } from '@raymanselltickets/common';

const router = express.Router();

router.get(
  '/api/tickets/:id',
  param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.status(200).send(ticket);
  }
);

export { router as showTicketRouter };
