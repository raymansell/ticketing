import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@raymanselltickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
