import { Types } from 'mongoose';
import { JsMsg } from '@nats-io/jetstream';
import {
  Subjects,
  Listener,
  TicketCreatedEvent,
} from '@raymanselltickets/common';
import { Ticket } from '../../models/ticket.js';
import { queueGroupName } from './queue-group-name.js';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: JsMsg) {
    const { id, title, price } = data;
    const ticket = new Ticket({ _id: new Types.ObjectId(id), title, price });
    await ticket.save();

    msg.ack();
  }
}
