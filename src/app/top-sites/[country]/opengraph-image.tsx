import { ImageResponse } from 'next/og';
import { SITES } from '../../data/sites';
import { getCountryBySlug } from '../data/countries';

export const alt = 'Most Visited Websites by Country Analytics';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ country: string }>;
}

export default async function Image({ params }: Props) {
  const { country: slug } = await params;
  const countryData = getCountryBySlug(slug);

  const name = countryData ? countryData.name : 'Country Analytics';
  const cfCode = countryData ? countryData.cfCode : 'GLOBAL';
  const internetUsers = countryData ? countryData.internetUsers : 'N/A';
  const penetration = countryData ? countryData.internetPenetration : 'N/A';

  // Get top 3 sites for country (pinned or top sites)
  const pinnedIds = countryData?.pinnedSiteIds ?? ['google', 'youtube', 'facebook'];
  const topSites = pinnedIds
    .map((id) => SITES.find((s) => s.id === id))
    .filter(Boolean)
    .slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'radial-gradient(circle at center, #0a0e1a 0%, #02020a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#ffffff',
          position: 'relative',
          padding: '40px',
        }}
      >
        {/* Background Grid Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.04,
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Outer Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.025)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '45px 55px',
            width: '1080px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Header Row: Country Code Badge & Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0047ab',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '24px',
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  border: '1px solid rgba(130, 200, 229, 0.3)',
                  boxShadow: '0 0 25px rgba(0, 71, 171, 0.5)',
                }}
              >
                {cfCode}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1px' }}>
                  Most Visited Websites in {name}
                </div>
                <div style={{ fontSize: '18px', color: '#82c8e5', fontWeight: 600, marginTop: '4px' }}>
                  {internetUsers} Internet Users · {penetration} Penetration (2026)
                </div>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '0 0 25px 0' }} />

          {/* Top 3 Sites Showcase */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {topSites.map((site, idx) => (
              <div
                key={site?.id ?? idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#82c8e5',
                    width: '30px',
                  }}
                >
                  #{idx + 1}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{site?.name}</div>
                  <div style={{ fontSize: '14px', color: '#6d8196', marginTop: '2px' }}>{site?.baseline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.3)',
            letterSpacing: '2px',
          }}
        >
          <span>WWW.PULSTRAFFIC.COM</span>
          <span>·</span>
          <span style={{ color: '#82c8e5', fontWeight: 700 }}>PULSE COUNTRY INDEX</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
