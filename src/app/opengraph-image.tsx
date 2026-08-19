import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pulse - Live Global Web Traffic Visualizer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #11132a 0%, #03030b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#ffffff',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Outer Glow Card Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '50px 80px',
          }}
        >
          {/* Logo Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#82c8e5',
              color: '#02020a',
              fontWeight: 900,
              fontSize: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              marginBottom: '20px',
            }}
          >
            P
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              letterSpacing: '-2px',
              color: '#82c8e5',
              marginBottom: '16px',
            }}
          >
            PULSE
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '24px',
              color: '#82c8e5',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            Live Global Web Traffic Visualizer
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '18px',
              color: '#6d8196',
              textAlign: 'center',
              maxWidth: '600px',
              lineHeight: '1.6',
            }}
          >
            A real-time analytics ticker visualizing estimated active visitors, session counts, and geo-traffic trends across the world's most popular websites.
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.25)',
            letterSpacing: '2px',
          }}
        >
          WWW.PULSTRAFFIC.COM
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
