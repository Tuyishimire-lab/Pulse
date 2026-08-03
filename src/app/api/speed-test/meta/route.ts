export const runtime = 'edge';

/**
 * Meta endpoint — returns connection metadata derived from Vercel/Cloudflare
 * request headers. Used to display ISP, city, country, and server region.
 */
export async function GET(request: Request) {
  const headers = request.headers;

  // Vercel provides geo headers on deployed functions
  const city = headers.get('x-vercel-ip-city') || 'Unknown';
  const country = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || 'Unknown';
  const region = headers.get('x-vercel-id')?.split('::')[0] || 'edge';
  const ip = headers.get('x-real-ip') || headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';

  // Mask the last octet for privacy
  const maskedIp = ip ? ip.replace(/\.\d+$/, '.***') : 'hidden';

  return new Response(
    JSON.stringify({
      ip: maskedIp,
      isp: 'Detected via network',  // True ASN lookup would need a third-party DB
      city: decodeURIComponent(city),
      country,
      server: region,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    },
  );
}
