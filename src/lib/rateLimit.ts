import { LRUCache } from 'lru-cache';
import { NextResponse } from 'next/server';

type RateLimitOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1]);
      } else {
        tokenCount[0] += 1;
        tokenCache.set(token, tokenCount);
      }
      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit;

      return {
        isRateLimited,
        currentUsage,
      };
    },
  };
}

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per minute
});

export function checkRateLimit(request: Request, limit: number = 20, routeKey?: string) {
  // Extract first IP from x-forwarded-for or fallback
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    (forwarded ? forwarded.split(',')[0].trim() : null) ||
    request.headers.get('x-real-ip') ||
    'anonymous';

  let namespace = routeKey;
  if (!namespace) {
    try {
      namespace = new URL(request.url).pathname;
    } catch {
      namespace = 'global';
    }
  }

  const compositeKey = `${namespace}:${ip}`;
  const { isRateLimited } = limiter.check(limit, compositeKey);

  if (isRateLimited) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  return null;
}
