import { NextRequest, NextResponse } from 'next/server';
import { SITES } from '../../../data/sites';
import { getSiteById } from '../../../../lib/getSites';

export const revalidate = 3600; // Cache badge for 1 hour

/**
 * Accurately estimate rendered width of text in -apple-system / Helvetica 11px bold.
 */
function estimateTextWidth(text: string): number {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[ilIj:;.,!'|()[\]]/.test(char)) {
      width += 4.2;
    } else if (/[MWmw]/.test(char)) {
      width += 10.0;
    } else if (/[A-Z#%&+]/.test(char)) {
      width += 7.8;
    } else if (char === ' ') {
      width += 4.0;
    } else if (/[0-9]/.test(char)) {
      width += 7.0;
    } else {
      width += 6.5;
    }
  }
  return width;
}

/**
 * Determine contrast text and shadow colors based on hex background luminance.
 */
function getContrastColor(hexColor: string): { text: string; shadow: string } {
  let hex = (hexColor || '#3b82f6').replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isBright = luminance > 0.65;
  return {
    text: isBright ? '#0f172a' : '#ffffff',
    shadow: isBright ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.35)',
  };
}

interface BadgeOptions {
  label: string;
  value: string;
  brandColor: string;
  theme: 'dark' | 'light';
}

function renderBadgeSvg({ label, value, brandColor, theme }: BadgeOptions): string {
  const isLight = theme === 'light';

  // Dynamic widths with safe minimums and 18px horizontal padding (9px on each side)
  const labelWidth = Math.max(60, Math.round(estimateTextWidth(label) + 18));
  const valueWidth = Math.max(50, Math.round(estimateTextWidth(value) + 18));
  const totalWidth = labelWidth + valueWidth;
  const height = 24;

  const labelX = Math.round(labelWidth / 2);
  const valueX = Math.round(labelWidth + valueWidth / 2);

  const labelBg = isLight ? '#f1f5f9' : '#1e293b';
  const labelText = isLight ? '#0f172a' : '#ffffff';
  const labelShadow = isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.35)';
  const borderColor = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)';

  const valueContrast = getContrastColor(brandColor);
  const valueText = valueContrast.text;
  const valueShadow = valueContrast.shadow;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="4" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="${labelBg}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${brandColor}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#b)"/>
    <rect x="0.5" y="0.5" width="${totalWidth - 1}" height="${height - 1}" rx="3.5" fill="none" stroke="${borderColor}"/>
  </g>
  <g text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" text-rendering="geometricPrecision">
    <text x="${labelX}" y="16" fill="${labelShadow}">${label}</text>
    <text x="${labelX}" y="15" fill="${labelText}">${label}</text>
    <text x="${valueX}" y="16" fill="${valueShadow}">${value}</text>
    <text x="${valueX}" y="15" fill="${valueText}">${value}</text>
  </g>
</svg>`.trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const site = (await getSiteById(id)) || SITES.find((s) => s.id === id);

  const themeParam = request.nextUrl.searchParams.get('theme')?.toLowerCase();
  const theme: 'dark' | 'light' = themeParam === 'light' ? 'light' : 'dark';

  if (!site) {
    const notFoundSvg = renderBadgeSvg({
      label: 'PULSE RANK',
      value: 'site not found',
      brandColor: '#ef4444',
      theme,
    });

    return new NextResponse(notFoundSvg, {
      status: 404,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }

  const label = 'PULSE RANK';
  const baselineMetric = site.baseline ? site.baseline.split(' ')[0] : '';
  const value = baselineMetric ? `#${site.rank} (${baselineMetric})` : `#${site.rank}`;
  const brandColor = site.color && site.color.trim() ? site.color.trim() : '#3b82f6';

  const svg = renderBadgeSvg({
    label,
    value,
    brandColor,
    theme,
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
