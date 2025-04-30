// The-Human-Tech-Blog-Server/src/Types/index.d.ts

import { IUser } from '../models/User';
import { Document } from 'mongoose';
declare global {
  namespace Express {
    interface Request {
      user?: IUser & Document;
    }
  }
}
