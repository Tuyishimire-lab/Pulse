import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Checks the `Authorization: Bearer <CRON_SECRET>` header on cron/admin routes.
 *
 * Returns null when the request is allowed, otherwise a response to send back:
 *   503 - CRON_SECRET is not configured (fail closed, signals a config problem)
 *   401 - header missing or wrong
 *
 * Auth is skipped outside production so local `npm run dev` can trigger jobs.
 */
export function cronAuthError(request: Request): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[auth] CRON_SECRET is not set - refusing to run unprotected.');
    return NextResponse.json(
      { success: false, error: 'Server misconfigured: CRON_SECRET is not set' },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(cronSecret);

  const valid =
    tokenBuffer.length === secretBuffer.length && timingSafeEqual(tokenBuffer, secretBuffer);

  if (!valid) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: invalid or missing CRON_SECRET' },
      { status: 401 },
    );
  }

  return null;
}
