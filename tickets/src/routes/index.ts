import express, { Request, Response } from 'express';
import { Ticket, TicketDoc } from '../models/ticket.js';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find<TicketDoc>({ orderId: undefined });

  res.send(tickets);
});

export { router as indexTicketRouter };
