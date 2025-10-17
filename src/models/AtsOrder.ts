// src/models/AtsOrder.ts
// Description: Mongoose model for PayPal ATS orders. We do not store CV/job ad content here.

import mongoose, { Schema, Document, Model } from 'mongoose';

export type AtsOrderStatus = 'CREATED' | 'CAPTURED' | 'CANCELLED' | 'FAILED';

export interface IAtsOrder extends Document {
  orderId: string; // PayPal order ID
  captureId?: string; // PayPal capture ID (after capture)
  amount: number; // Amount in minor units? We store decimal in EUR as number
  currency: 'EUR';
  status: AtsOrderStatus;
  payerEmail?: string;
  usedForGeneration: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AtsOrderSchema = new Schema<IAtsOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    captureId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['EUR'], required: true, default: 'EUR' },
    status: {
      type: String,
      enum: ['CREATED', 'CAPTURED', 'CANCELLED', 'FAILED'],
      required: true,
      default: 'CREATED',
    },
    payerEmail: { type: String },
    usedForGeneration: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const AtsOrder: Model<IAtsOrder> =
  (mongoose.models.AtsOrder as Model<IAtsOrder>) ||
  mongoose.model<IAtsOrder>('AtsOrder', AtsOrderSchema);
