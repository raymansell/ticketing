import { Document, Schema, model } from 'mongoose';

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

export interface PaymentDoc extends Document, PaymentAttrs {}

const paymentSchema = new Schema<PaymentDoc>(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        const { _id, orderId, stripeId } = ret;
        return { id: _id, orderId, stripeId };
      },
    },
  }
);

const PaymentModel = model<PaymentDoc>('Payment', paymentSchema);

export class Payment extends PaymentModel {
  constructor(attrs: PaymentAttrs) {
    super(attrs);
  }
}
