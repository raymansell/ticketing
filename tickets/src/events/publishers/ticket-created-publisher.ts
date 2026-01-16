import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@raymanselltickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
