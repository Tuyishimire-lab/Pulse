import { ImageResponse } from 'next/og';
import { CATEGORIES, SITES } from '../../data/sites';
import { getSites } from '../../../lib/getSites';

export const runtime = 'edge';
export const alt = 'Website Category Traffic Rankings';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.id === slug);
  const categoryLabel = category ? category.label : 'Category';

  let sites = SITES.filter((s) => s.category === slug);
  try {
    const liveSites = await getSites();
    const liveFiltered = liveSites.filter((s) => s.category === slug);
    if (liveFiltered.length > 0) sites = liveFiltered;
  } catch {
    // fallback to static
  }

  const topSites = sites.slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0e1a 0%, #02020a 100%)',
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
        {/* Outer Card */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            padding: '48px',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#82c8e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#02020a',
                  fontSize: '20px',
                }}
              >
                P
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
                  Pulse
                </span>
                <span style={{ fontSize: '13px', color: '#6d8196', letterSpacing: '0.5px' }}>
                  TRAFFIC INDEX 2026
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '999px',
                backgroundColor: 'rgba(130, 200, 229, 0.1)',
                border: '1px solid rgba(130, 200, 229, 0.2)',
                color: '#82c8e5',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {categoryLabel} Sector
            </div>
          </div>

          {/* Main Center Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 'bold',
                letterSpacing: '-1px',
                margin: 0,
                color: '#ffffff',
              }}
            >
              Top {categoryLabel} Websites
            </h1>
            <p style={{ fontSize: '20px', color: '#94a3b8', margin: 0 }}>
              Live real-time visitor flow, rankings, and traffic analytics
            </p>
          </div>

          {/* Top Sites Row */}
          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            {topSites.map((site, index) => (
              <div
                key={site.id}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#6d8196', fontWeight: 'bold' }}>
                    #{index + 1}
                  </span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(130, 200, 229, 0.15)',
                      color: site.color || '#82c8e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    {site.logo}
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{site.name}</span>
                </div>
                <span style={{ fontSize: '14px', color: '#82c8e5', fontWeight: 'bold' }}>
                  {site.baseline}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '16px',
            }}
          >
            <span style={{ fontSize: '14px', color: '#6d8196' }}>
              Real-time Global Internet Traffic Telemetry
            </span>
            <span style={{ fontSize: '14px', color: '#82c8e5', fontWeight: 'bold' }}>
              www.pulstraffic.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
