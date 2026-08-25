export async function GET() {
  return new Response('14eac490de1941d88e198247a1246901', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
