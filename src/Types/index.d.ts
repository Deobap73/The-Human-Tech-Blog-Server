// The-Human-Tech-Blog-Server/src/Types/index.d.ts

/**
 * Type declarations for extending Express.js Request object
 *
 * This file extends the Express Request interface to include
 * our custom user property with TypeScript type information.
 *
 * @module ExpressExtensions
 */

// src/Types/index.d.ts
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
