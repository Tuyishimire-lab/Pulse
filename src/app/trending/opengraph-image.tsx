import { ImageResponse } from 'next/og';
import { getTrendingData } from '../../lib/getTrendingData';
import { CURRENT_YEAR } from '../../lib/currentYear';

export const revalidate = 3600;
export const alt = `Trending Websites - Biggest Rank Movers (${CURRENT_YEAR}) | Pulse`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const datasets = await getTrendingData();
  const primary =
    datasets['7d']?.available && datasets['7d'].risers.length > 0
      ? datasets['7d']
      : datasets['24h']?.available && datasets['24h'].risers.length > 0
      ? datasets['24h']
      : datasets['30d'];

  const topRisers = (primary?.risers || []).slice(0, 3);
  const topFallers = (primary?.fallers || []).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1226 0%, #03030b 100%)',
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
                fontSize: '14px',
                fontWeight: 800,
                color: '#82c8e5',
                letterSpacing: '2px',
                marginBottom: '8px',
              }}
            >
              PULSE TRAFFIC INDEX · LIVE RANK MOVERS
            </div>
            <div style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1px' }}>
              Trending Websites ({CURRENT_YEAR})
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {primary?.timeframe?.toUpperCase() || '7D'} VELOCITY LEADERBOARD
          </div>
        </div>

        {/* Columns: Risers & Fallers */}
        <div style={{ display: 'flex', gap: '32px', marginTop: '16px', marginBottom: '16px' }}>
          {/* Top Climbers */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '20px',
              padding: '24px 28px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#34d399',
                letterSpacing: '1.5px',
                marginBottom: '16px',
              }}
            >
              ▲ BIGGEST CLIMBERS
            </div>
            {topRisers.length > 0 ? (
              topRisers.map((site) => (
                <div
                  key={site.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: site.color || '#3b82f6',
                        color: site.color === '#ffffff' ? '#0f172a' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '16px',
                      }}
                    >
                      {site.logo}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800 }}>{site.name}</span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Rank #{site.currentRank} · {site.baseline}/mo
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 900,
                      color: '#34d399',
                    }}
                  >
                    +{site.delta}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '16px', color: '#94a3b8' }}>
                Tracking live rank movements across 200 global domains
              </div>
            )}
          </div>

          {/* Biggest Decliners */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '20px',
              padding: '24px 28px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#f87171',
                letterSpacing: '1.5px',
                marginBottom: '16px',
              }}
            >
              ▼ BIGGEST DECLINERS
            </div>
            {topFallers.length > 0 ? (
              topFallers.map((site) => (
                <div
                  key={site.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: site.color || '#ef4444',
                        color: site.color === '#ffffff' ? '#0f172a' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '16px',
                      }}
                    >
                      {site.logo}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800 }}>{site.name}</span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Rank #{site.currentRank} · {site.baseline}/mo
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 900,
                      color: '#f87171',
                    }}
                  >
                    {site.delta}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '16px', color: '#94a3b8' }}>
                Real-time rank trajectory monitoring
              </div>
            )}
          </div>
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
          <span>WWW.PULSTRAFFIC.COM/TRENDING</span>
          <span style={{ color: '#82c8e5', fontWeight: 800 }}>PULSE REAL-TIME ANALYTICS</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
