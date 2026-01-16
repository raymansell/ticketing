import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@raymanselltickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
