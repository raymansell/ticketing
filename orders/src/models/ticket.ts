import { Document, Model, Schema, Types, model } from 'mongoose';
import { versionOCCPlugin } from '@raymanselltickets/common';
import { Order, OrderDoc, OrderStatus } from './order.js';

interface TicketAttrs {
  _id: Types.ObjectId;
  title: string;
  price: number;
}

export interface TicketDoc extends Document, TicketAttrs {
  version: number;
  isReserved(): Promise<boolean>;
}

interface ITicketModel extends Model<TicketDoc> {
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new Schema<TicketDoc>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        const { _id, title, price } = ret;
        return { id: _id, title, price };
      },
    },
    versionKey: 'version',
  }
);

// Implement optimistic concurrency control
ticketSchema.plugin(versionOCCPlugin);

ticketSchema.statics.findByEvent = function (event: {
  id: string;
  version: number;
}) {
  // this === the Ticket model
  return this.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.methods.isReserved = async function () {
  // Run query to look at all orders. Find an order where the ticket
  // is the ticket we just found *and* the orders status is *not* cancelled (not OrderStatus.Cancelled).
  // If we find and order from this that means the ticket *is* reserved.
  // this === the ticket document that we just called 'isReserved' on
  const existingOrder = await Order.findOne<OrderDoc>({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const TicketModel = model<TicketDoc, ITicketModel>('Ticket', ticketSchema);

export class Ticket extends TicketModel {
  constructor(attrs: TicketAttrs) {
    super(attrs);
  }
}
