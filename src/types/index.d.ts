// The-Human-Tech-Blog-Server/src/Types/index.d.ts

import { Document, Types } from 'mongoose';
import { IUser } from '../models/User';
import { UserDoc } from '../models/User';
import { Socket as IOSocket } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Use diretamente a interface do modelo
    }
  }
}

declare module 'socket.io' {
  interface Socket {
    user?: UserDoc;
  }
}
