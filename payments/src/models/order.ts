import { Document, Schema, Types, model } from 'mongoose';
import { OrderStatus, versionOCCPlugin } from '@raymanselltickets/common';

export { OrderStatus };

interface OrderAttrs {
  _id: Types.ObjectId;
  price: number;
  userId: string;
  status: OrderStatus;
}

export interface OrderDoc extends Document, OrderAttrs {
  version: number;
}

const orderSchema = new Schema<OrderDoc>(
  {
    price: {
      type: Number,
      required: true,
    },
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
  },
  {
    toJSON: {
      transform(doc, ret) {
        const { _id, price, userId, status } = ret;
        return { id: _id, price, userId, status };
      },
    },
    versionKey: 'version',
  }
);

// Implement optimistic concurrency control
orderSchema.plugin(versionOCCPlugin);

const OrderModel = model<OrderDoc>('Order', orderSchema);

export class Order extends OrderModel {
  constructor(attrs: OrderAttrs) {
    super(attrs);
  }
}
