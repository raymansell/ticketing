import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from '@raymanselltickets/common';
import { JsMsg } from '@nats-io/jetstream';
import { queueGroupName } from './queueGroupName.js';
import { Ticket, TicketDoc } from '../../models/ticket.js';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher.js';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: JsMsg) {
    const ticket = await Ticket.findById<TicketDoc>(data.ticket.id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(this.jsClient).publish({
      version: ticket.version,
      id: ticket._id.toString(),
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
