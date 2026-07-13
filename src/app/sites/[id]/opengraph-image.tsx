import { ImageResponse } from 'next/og';
import { SITES } from '../../data/sites';

export const alt = 'Pulse Website Traffic Analytics Details';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const site = SITES.find((s) => s.id === id);
  
  const siteName = site ? site.name : 'Domain Not Found';
  const siteUrl = site ? site.url.replace('https://', '').replace('http://', '').replace('www.', '') : '';
  const rank = site ? `#${site.rank}` : 'N/A';
  const baseline = site ? site.baseline : 'N/A';
  const category = site ? site.category.toUpperCase() : 'UNKNOWN';
  const color = site ? site.color : '#82c8e5';
  const logo = site ? site.logo : '?';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'radial-gradient(circle at center, #11132a 0%, #03030b 100%)',
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
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Dashboard Card Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '50px 60px',
            width: '900px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Top Row with Brand & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: color,
                  color: color === '#ffffff' ? '#111111' : '#ffffff',
                  fontWeight: 900,
                  fontSize: '32px',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  boxShadow: `0 0 30px ${color}40`,
                }}
              >
                {logo}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1px' }}>
                  {siteName}
                </div>
                <div style={{ fontSize: '18px', color: '#6d8196', marginTop: '4px' }}>
                  {siteUrl}
                </div>
              </div>
            </div>
            
            {/* Category badge */}
            <div
              style={{
                fontSize: '14px',
                color: '#82c8e5',
                border: '1px solid rgba(130, 200, 229, 0.3)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontWeight: 700,
                letterSpacing: '1px',
              }}
            >
              {category}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '0 0 30px 0' }} />

          {/* Statistics Grid */}
          <div style={{ display: 'flex', gap: '40px' }}>
            {/* Rank Box */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#6d8196', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px' }}>
                GLOBAL RANK
              </div>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#82c8e5' }}>
                {rank}
              </div>
            </div>

            {/* Baseline Visits Box */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#6d8196', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px' }}>
                ESTIMATED MONTHLY VISITS
              </div>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#ffffff' }}>
                {baseline}
              </div>
            </div>
          </div>
        </div>

        {/* Brand signature at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.25)',
            letterSpacing: '1.5px',
          }}
        >
          <span>REAL-TIME INSIGHTS BY</span>
          <span style={{ color: '#82c8e5', fontWeight: 700 }}>PULSE</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
