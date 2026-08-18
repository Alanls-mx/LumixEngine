import type { NextFunction, Request, RequestHandler, Response } from 'express';

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  message: string;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const productionOrigins = ['https://lumixengine.com', 'https://www.lumixengine.com'];
const developmentOrigins = [
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function parseOriginList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getAllowedOrigins() {
  const configuredOrigins = parseOriginList(process.env.CORS_ORIGINS);
  const baseOrigins = configuredOrigins.length > 0 ? configuredOrigins : productionOrigins;

  if (process.env.NODE_ENV === 'production') {
    return baseOrigins;
  }

  return [...new Set([...baseOrigins, ...developmentOrigins])];
}

export function isAllowedOrigin(origin: string | undefined) {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(origin);
}

export const corsOptions = {
  origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    callback(null, isAllowedOrigin(origin));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false,
  maxAge: 600,
};

export const securityHeaders: RequestHandler = (_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.setHeader('Cache-Control', 'no-store');

  if (process.env.NODE_ENV === 'production') {
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

export const rejectUnknownOrigin: RequestHandler = (request, response, next) => {
  const origin = request.get('origin');

  if (origin && !isAllowedOrigin(origin)) {
    response.status(403).json({
      ok: false,
      message: 'Origem não autorizada para acessar a API da LumixEngine.',
    });
    return;
  }

  next();
};

export function requireTrustedBrowserOrigin(): RequestHandler {
  return (request, response, next) => {
    if (process.env.NODE_ENV !== 'production' || process.env.REQUIRE_TRUSTED_ORIGIN === 'false') {
      next();
      return;
    }

    const origin = request.get('origin');
    const referer = request.get('referer');
    const hasTrustedOrigin = Boolean(origin && isAllowedOrigin(origin));
    const hasTrustedReferer = Boolean(
      referer &&
        getAllowedOrigins().some((allowedOrigin) => referer === `${allowedOrigin}/` || referer.startsWith(`${allowedOrigin}/`)),
    );

    if (!hasTrustedOrigin && !hasTrustedReferer) {
      response.status(403).json({
        ok: false,
        message: 'Envio bloqueado: use o formulário oficial da LumixEngine.',
      });
      return;
    }

    next();
  };
}

function resolveClientKey(request: Request) {
  const forwardedFor = request.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || request.ip || request.socket.remoteAddress || 'unknown';

  return `${ip}:${request.method}:${request.baseUrl || request.path}`;
}

export function createRateLimiter(options: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, RateBucket>();

  return (request: Request, response: Response, next: NextFunction) => {
    const now = Date.now();
    const key = resolveClientKey(request);
    const currentBucket = buckets.get(key);

    if (!currentBucket || currentBucket.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      next();
      return;
    }

    currentBucket.count += 1;

    if (currentBucket.count > options.maxRequests) {
      const retryAfterSeconds = Math.ceil((currentBucket.resetAt - now) / 1000);

      response.setHeader('Retry-After', String(retryAfterSeconds));
      response.status(429).json({
        ok: false,
        message: options.message,
      });
      return;
    }

    if (buckets.size > 10000) {
      for (const [bucketKey, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) {
          buckets.delete(bucketKey);
        }
      }
    }

    next();
  };
}
