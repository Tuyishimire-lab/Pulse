import { NextResponse } from 'next/server';
import { checkRateLimit } from '../../../lib/rateLimit';
import { fetchOutagesData } from '../../../lib/radarOutages';

export const revalidate = 60;

export async function GET(req: Request) {
  const rateLimitResponse = checkRateLimit(req, 30, '/api/outages');
  if (rateLimitResponse) return rateLimitResponse;

  const { source, outages } = await fetchOutagesData();

  return NextResponse.json(
    {
      success: true,
      source,
      outages,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
