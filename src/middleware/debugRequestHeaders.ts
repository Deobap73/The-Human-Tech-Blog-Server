// ✅ The-Human-Tech-Blog-Server/src/middleware/debugRequestHeaders.ts

import { Request, Response, NextFunction } from 'express';

const debugRequestHeaders = (req: Request, _res: Response, next: NextFunction): void => {
  console.log('🔍 Incoming Headers:', req.headers);
  next();
};

export default debugRequestHeaders;
export {};
