// The-Human-Tech-Blog-Server/src/middleware/securityMiddleware.ts

import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import { Express } from 'express';

export const setupSecurityMiddleware = (app: Express): void => {
  // 🛡️ Proteção contra ataques comuns em headers
  app.use(helmet());

  // 🧼 Proteção contra NoSQL Injection
  app.use(
    mongoSanitize({
      replaceWith: '_',
    })
  );

  // 💬 Logging para confirmar que foi aplicado
  console.log('✅ Security middlewares applied: Helmet + Mongo Sanitize');
};
