// src/middleware/debugBodySize.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Dev-only middleware to log request body size for debugging large payloads.
 * Safe for JSON/urlencoded payloads (post-parsers). Not used in production.
 */
export function debugBodySize(req: Request, _res: Response, next: NextFunction): void {
  try {
    const contentLength = req.headers['content-length'];
    let parsedLength = 0;

    // Compute parsed body size if serializable
    try {
      const serialized = JSON.stringify(req.body ?? {});
      parsedLength = Buffer.byteLength(serialized);
    } catch {
      parsedLength = -1; // unable to serialize
    }

    console.log('[debugBodySize]', {
      method: req.method,
      path: req.originalUrl,
      contentLengthHeader: contentLength ?? 'N/A',
      parsedBodyLengthBytes: parsedLength >= 0 ? parsedLength : 'unserializable',
    });
  } catch (e) {
    console.warn('[debugBodySize] Failed to inspect body size:', e);
  }
  next();
}
