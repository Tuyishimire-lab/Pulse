import { NextResponse } from 'next/server';
import { getRadarStats } from '../../../lib/getRadarStats';

export const revalidate = 300; // Revalidate at most once every 5 minutes
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location') || 'global';
  const data = await getRadarStats(location);
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
