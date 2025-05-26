// /src/middleware/detectLanguage.ts
import { Request, Response, NextFunction } from 'express';

export function detectLanguage(req: Request, _res: Response, next: NextFunction) {
  let lang = 'en';

  if (req.params.lang && ['en', 'pt', 'de', 'es'].includes(req.params.lang)) {
    lang = req.params.lang;
  } else if (req.headers['accept-language']) {
    const headerLang = req.headers['accept-language'].split(',')[0].split('-')[0];
    if (['en', 'pt', 'de', 'es'].includes(headerLang)) {
      lang = headerLang;
    }
  }

  (req as any).lang = lang;
  next();
}
