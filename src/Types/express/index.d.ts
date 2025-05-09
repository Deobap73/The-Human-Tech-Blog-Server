// src/types/express/index.d.ts (para adicionar csrfToken ao tipo Request)
declare namespace Express {
  interface Request {
    csrfToken(): string;
  }
}
