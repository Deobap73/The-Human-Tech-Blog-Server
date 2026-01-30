// ./src/models/UploadTicket.ts
'use strict';

import mongoose, { Schema, type InferSchemaType } from 'mongoose';

type UploadTicketType = 'POST_COVER' | 'POST_INSTAGRAM_IMAGE';

const UploadTicketSchema = new Schema(
  {
    seq: { type: Number, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['POST_COVER', 'POST_INSTAGRAM_IMAGE'] satisfies UploadTicketType[],
      index: true,
    },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// Ensure uniqueness per type, not globally.
// This prevents collisions like POST_COVER seq 5 and POST_INSTAGRAM_IMAGE seq 5.
UploadTicketSchema.index({ type: 1, seq: 1 }, { unique: true });

export type UploadTicketDoc = InferSchemaType<typeof UploadTicketSchema> & {
  _id: mongoose.Types.ObjectId;
};

const UploadTicket =
  (mongoose.models.UploadTicket as mongoose.Model<UploadTicketDoc>) ||
  mongoose.model<UploadTicketDoc>('UploadTicket', UploadTicketSchema);

type CounterDoc = {
  _id: string;
  seq: number;
};

const CounterSchema = new Schema<CounterDoc>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const Counter =
  (mongoose.models.Counter as mongoose.Model<CounterDoc>) ||
  mongoose.model<CounterDoc>('Counter', CounterSchema);

export async function createUploadTicket(params: {
  type: UploadTicketType;
  meta?: Record<string, unknown>;
}): Promise<UploadTicketDoc> {
  const { type, meta } = params;

  const counter = await Counter.findOneAndUpdate(
    { _id: `UploadTicket:${type}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).lean<CounterDoc>();

  const ticket = await UploadTicket.create({
    seq: counter.seq,
    type,
    meta: meta ?? {},
  });

  return ticket;
}