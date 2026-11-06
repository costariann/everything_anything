import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../errors/AppError';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}

interface ClientBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, ClientBucket>();

// Periodically prune expired rate-limit buckets every 60 seconds to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}, 60_000).unref();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests from this IP, please try again shortly.',
    keyPrefix = 'global',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const clientIp = getClientIp(req);
    const key = `${keyPrefix}:${clientIp}`;

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = {
        count: 1,
        resetAt: now + windowMs,
      };
      buckets.set(key, bucket);
    } else {
      bucket.count += 1;
    }

    const remaining = Math.max(0, max - bucket.count);
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return next(new TooManyRequestsError(message));
    }

    return next();
  };
}

/**
 * Tier 1: Global API Rate Limiter (300 requests per 1 minute per IP)
 */
export const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  keyPrefix: 'api',
  message: 'Too many API requests. Please wait a moment before refreshing.',
});

/**
 * Tier 2: Strict Authentication Rate Limiter (15 attempts per 15 minutes per IP)
 * Protects /auth/login and /auth/register against brute-force & credential stuffing
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please wait 15 minutes and try again.',
});

/**
 * Tier 3: Checkout & Payment Initialization Limiter (20 requests per 5 minutes per IP)
 * Protects against inventory-depletion bots and payment gateway abuse
 */
export const checkoutLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
  keyPrefix: 'checkout',
  message: 'Too many checkout or payment requests. Please wait a few minutes.',
});

