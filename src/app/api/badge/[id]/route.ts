import { NextRequest, NextResponse } from 'next/server';
import { SITES } from '../../../data/sites';
import { getSiteById } from '../../../../lib/getSites';

export const revalidate = 3600; // Cache badge for 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const site = (await getSiteById(id)) || SITES.find((s) => s.id === id);

  if (!site) {
    return new NextResponse('Site Not Found', { status: 404 });
  }

  const label = 'PULSE RANK';
  const value = `#${site.rank} (${site.baseline.split(' ')[0]})`;
  const color = '#3b82f6';

  // SVG dimensions
  const labelWidth = 85;
  const valueWidth = 105;
  const totalWidth = labelWidth + valueWidth;
  const height = 24;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="${totalWidth}" height="${height}" rx="4" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <rect width="${labelWidth}" height="${height}" fill="#1e293b"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${color}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700">
    <text x="${labelWidth / 2}" y="16" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="15">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="16" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15">${value}</text>
  </g>
</svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
