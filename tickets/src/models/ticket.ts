import { versionOCCPlugin } from '@raymanselltickets/common';
import { Document, Schema, model } from 'mongoose';

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

export interface TicketDoc extends Document, TicketAttrs {
  version: number;
  orderId?: string;
}

const ticketSchema = new Schema<TicketDoc>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    userId: { type: String, required: true },
    orderId: { type: String },
  },
  {
    toJSON: {
      transform(doc, ret) {
        const { _id, title, price, userId /*, orderId*/ } = ret;
        return { id: _id, title, price, userId /*, orderId*/ };
      },
    },
    versionKey: 'version',
  }
);

// Implement optimistic concurrency control
ticketSchema.plugin(versionOCCPlugin);

const TicketModel = model<TicketDoc>('Ticket', ticketSchema);

export class Ticket extends TicketModel {
  constructor(attrs: TicketAttrs) {
    super(attrs);
  }
}
