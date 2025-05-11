// src/types/WithId.ts
import { Types } from 'mongoose';

export type WithId<T> = T & { _id: Types.ObjectId };
