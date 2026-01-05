// ./src/config/cors.ts
import type { CorsOptions } from 'cors';

type BuildCorsOptionsInput = {
  clientUrl?: string;
  railwayFrontendUrl?: string;
  railwayBackendUrl?: string;
  nodeEnv?: string;
};

function safeParseOrigin(value: string): string | null {
  const raw = (value || '').trim();
  if (!raw) return null;

  try {
    const u = new URL(raw);
    const protocol = u.protocol.toLowerCase();
    const host = u.host.toLowerCase();

    if (protocol !== 'http:' && protocol !== 'https:') return null;

    return `${protocol}//${host}`;
  } catch {
    return null;
  }
}

function addOriginVariants(set: Set<string>, origin: string | null): void {
  if (!origin) return;

  set.add(origin);

  try {
    const u = new URL(origin);
    const protocol = u.protocol;
    const host = u.host;

    if (host.startsWith('www.')) {
      const noWww = host.replace(/^www\./, '');
      set.add(`${protocol}//${noWww}`);
      return;
    }

    set.add(`${protocol}//www.${host}`);
  } catch {
    return;
  }
}

function buildAllowedOrigins(input: BuildCorsOptionsInput): Set<string> {
  const allowed = new Set<string>();

  addOriginVariants(allowed, safeParseOrigin(input.clientUrl || ''));
  addOriginVariants(allowed, safeParseOrigin(input.railwayFrontendUrl || ''));
  addOriginVariants(allowed, safeParseOrigin(input.railwayBackendUrl || ''));

  addOriginVariants(allowed, safeParseOrigin('http://localhost:5173'));
  addOriginVariants(allowed, safeParseOrigin('http://127.0.0.1:5173'));

  return allowed;
}

export function buildCorsOptions(input: BuildCorsOptionsInput): CorsOptions {
  const allowedOrigins = buildAllowedOrigins(input);

  const isProd = (input.nodeEnv || '').trim().toLowerCase() === 'production';

  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalized = safeParseOrigin(origin);

      if (!normalized) {
        console.warn(`[CORS] Blocked invalid Origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      }

      if (!allowedOrigins.has(normalized)) {
        console.warn(`[CORS] Blocked by CORS: ${normalized}`);
        if (!isProd) {
          console.warn(`[CORS] Allowed origins: ${Array.from(allowedOrigins).join(', ')}`);
        }
        return callback(new Error('Not allowed by CORS'), false);
      }

      return callback(null, true);
    },
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'XSRF-TOKEN',
      'x-xsrf-token',
      'X-XSRF-Token',
    ],
    exposedHeaders: ['Set-Cookie', 'XSRF-TOKEN'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
  };
}
