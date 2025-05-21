// ✅ The-Human-Tech-Blog-Server/src/Types/index.d.ts

import { IUser } from '../../types/User';
import { UserDoc } from '../models/User';
import { Socket as IOSocket } from 'socket.io';

// 👇 Define `req.user` globalmente para Express
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// 👇 Estende tipo do Socket com user
declare module 'socket.io' {
  interface Socket {
    user?: UserDoc;
  }
}
