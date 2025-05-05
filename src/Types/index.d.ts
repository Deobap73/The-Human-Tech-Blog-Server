// The-Human-Tech-Blog-Server/src/Types/index.d.ts

import { Document, Types } from 'mongoose';
import { IUser } from '../models/User'; // Importe a interface do modelo

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Use diretamente a interface do modelo
    }
  }
}
