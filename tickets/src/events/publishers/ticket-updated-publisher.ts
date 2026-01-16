import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@raymanselltickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
