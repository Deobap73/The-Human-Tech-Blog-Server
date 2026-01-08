// /src/models/AutomationToken.ts

'use strict';

import mongoose, { Schema, InferSchemaType } from 'mongoose';

const AutomationTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    lastUsedAt: { type: Date, required: false },
    expiresAt: { type: Date, required: false, index: true },
    revokedAt: { type: Date, required: false, index: true },
  },
  { timestamps: true }
);

export type AutomationTokenDoc = InferSchemaType<typeof AutomationTokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

const AutomationToken = mongoose.model('AutomationToken', AutomationTokenSchema);
export default AutomationToken;
