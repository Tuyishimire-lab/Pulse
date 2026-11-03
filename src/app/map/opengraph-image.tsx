import { ImageResponse } from 'next/og';
import { CURRENT_YEAR } from '../../lib/currentYear';

export const revalidate = 86400;
export const alt = `Global Web Traffic Map ${CURRENT_YEAR} | Pulse`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const highlights = [
    { region: 'United States', users: '311M Online', penetration: '92%', leader: 'Reddit & YouTube' },
    { region: 'India', users: '900M Online', penetration: '63%', leader: 'YouTube & WhatsApp' },
    { region: 'Brazil', users: '165M Online', penetration: '77%', leader: 'TikTok & Mercado Libre' },
    { region: 'Japan', users: '104M Online', penetration: '85%', leader: 'Yahoo! Japan & LINE' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #06152d 0%, #03030b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, sans-serif',
          color: '#ffffff',
          padding: '52px 64px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: '14px',
                fontWeight: 800,
                color: '#82c8e5',
                letterSpacing: '2px',
                marginBottom: '8px',
              }}
            >
              CLOUDFLARE RADAR · 115+ COUNTRIES TELEMETRY
            </div>
            <div style={{ display: 'flex', fontSize: '44px', fontWeight: 900, letterSpacing: '-1px' }}>
              {`Global Web Traffic Map (${CURRENT_YEAR})`}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(130, 200, 229, 0.12)',
              border: '1px solid rgba(130, 200, 229, 0.35)',
              color: '#82c8e5',
              fontSize: '16px',
              fontWeight: 800,
            }}
          >
            5.4B+ CONNECTED USERS
          </div>
        </div>

        {/* Regional Cards Grid */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
          {highlights.map((h) => (
            <div
              key={h.region}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                background: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#82c8e5',
                  letterSpacing: '1px',
                }}
              >
                {`${h.penetration} PENETRATION`}
              </div>
              <div style={{ display: 'flex', fontSize: '24px', fontWeight: 900, marginTop: '8px' }}>
                {h.region}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#34d399',
                  marginTop: '6px',
                }}
              >
                {h.users}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '13px',
                  color: '#94a3b8',
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {`Local Leader: ${h.leader}`}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: '#6d8196',
            letterSpacing: '1px',
          }}
        >
          <span>WWW.PULSTRAFFIC.COM/MAP</span>
          <span style={{ color: '#82c8e5', fontWeight: 800 }}>
            INTERACTIVE 3D GLOBE &amp; REGIONAL LEADERS
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
