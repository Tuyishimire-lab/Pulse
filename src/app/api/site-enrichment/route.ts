import { NextResponse } from 'next/server';
import { getSiteEnrichment } from '../../../lib/getSiteEnrichment';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('id');

  if (!siteId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const enrichment = await getSiteEnrichment(siteId);

  return NextResponse.json(enrichment, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
