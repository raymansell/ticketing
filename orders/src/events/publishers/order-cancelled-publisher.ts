import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@raymanselltickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
