// src/middleware/rateLimitMiddleware.ts

import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Max 100 requests per IP per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Returns rate limit info in headers
  legacyHeaders: false, // Remove headers X-RateLimit-*
});
