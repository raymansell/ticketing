import { JsMsg } from '@nats-io/jetstream';
import {
  Subjects,
  Listener,
  TicketUpdatedEvent,
} from '@raymanselltickets/common';
import { Ticket } from '../../models/ticket.js';
import { queueGroupName } from './queue-group-name.js';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: JsMsg) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
