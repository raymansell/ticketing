import { Document, Schema, model } from 'mongoose';
import { OrderStatus, versionOCCPlugin } from '@raymanselltickets/common';
import { TicketDoc } from './ticket.js';

export { OrderStatus };

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

export interface OrderDoc extends Document, OrderAttrs {
  version: number;
}

const orderSchema = new Schema<OrderDoc>(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: Schema.Types.Date,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        const { _id, userId, status, expiresAt, ticket } = ret;
        return { id: _id, userId, status, expiresAt, ticket };
      },
    },
    versionKey: 'version',
  }
);

orderSchema.plugin(versionOCCPlugin);

const OrderModel = model<OrderDoc>('Order', orderSchema);

export class Order extends OrderModel {
  constructor(attrs: OrderAttrs) {
    super(attrs);
  }
}
