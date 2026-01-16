import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@raymanselltickets/common';
import { JsMsg } from '@nats-io/jetstream';
import { queueGroupName } from './queueGroupName.js';
import { Ticket } from '../../models/ticket.js';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher.js';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId propery
    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();

    // we emit this event to preserve data integrity (matching versions) in the tickets collection located in the orders microservice
    // https://globant.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565138
    // https://globant.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565236#questions/11810402
    await new TicketUpdatedPublisher(this.jsClient).publish({
      version: ticket.version,
      id: ticket._id.toString(),
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    // ack the message
    msg.ack();
  }
}
