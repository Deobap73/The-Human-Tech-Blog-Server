// src/types/express/index.d.ts

import { IUser } from '../../models/User';

declare namespace Express {
  interface Request {
    csrfToken(): string;
    user?: WithId<IUser>;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
