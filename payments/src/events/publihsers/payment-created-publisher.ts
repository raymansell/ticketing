import {
  Publisher,
  PaymentCreatedEvent,
  Subjects,
} from '@raymanselltickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
