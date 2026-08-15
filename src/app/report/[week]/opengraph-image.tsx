import { ImageResponse } from 'next/og';
import { generateWeeklyReport, parsReportSlug } from '../data/reportGenerator';

export const alt = 'Pulse Weekly Internet Traffic Intelligence Report';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ week: string }>;
}

export default async function Image({ params }: Props) {
  const { week: slug } = await params;
  const date = parsReportSlug(slug);

  let headline = 'Weekly Internet Traffic Intelligence Report';
  let weekLabel = slug.toUpperCase();
  let healthScore = 98;
  let moverNames: string[] = ['Google', 'ChatGPT', 'YouTube'];

  if (date) {
    try {
      const report = await generateWeeklyReport(slug);
      headline = report.headline;
      weekLabel = `Week ${report.weekNumber}, ${report.year}`;
      healthScore = report.internetHealthScore;
      if (report.topMovers && report.topMovers.length > 0) {
        moverNames = report.topMovers.slice(0, 3).map((m) => m.site.name);
      }
    } catch {
      // fallback to defaults
    }
  }

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
                  WEEKLY INTELLIGENCE REPORT
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
              {weekLabel}
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h1
              style={{
                fontSize: '44px',
                fontWeight: 'bold',
                letterSpacing: '-1px',
                margin: 0,
                color: '#ffffff',
                lineHeight: 1.2,
              }}
            >
              {headline}
            </h1>
            <p style={{ fontSize: '18px', color: '#94a3b8', margin: 0 }}>
              Global outage analysis, rank volatility, and traffic trends across top 100 domains
            </p>
          </div>

          {/* Stats Badges */}
          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '16px 20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#6d8196', textTransform: 'uppercase' }}>
                Internet Health Score
              </span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399' }}>
                {healthScore}/100
              </span>
            </div>

            <div
              style={{
                flex: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '16px 20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#6d8196', textTransform: 'uppercase' }}>
                Key Rank Movers
              </span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#82c8e5' }}>
                {moverNames.join(' · ')}
              </span>
            </div>
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
              Pulse Traffic Index™ Multi-Signal Telemetry
            </span>
            <span style={{ fontSize: '14px', color: '#82c8e5', fontWeight: 'bold' }}>
              www.pulstraffic.com/report/{slug}
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
