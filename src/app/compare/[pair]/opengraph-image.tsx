import { ImageResponse } from 'next/og';
import { SITES } from '../../data/sites';
import { getPairBySlug, parsePairSlug } from '../data/pairs';
import { CURRENT_YEAR } from '../../../lib/currentYear';

export const runtime = 'edge';
export const alt = 'Pulse Platform VS Traffic Comparison';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ pair: string }>;
}

export default async function Image({ params }: Props) {
  const { pair: slug } = await params;

  const known = getPairBySlug(slug);
  const parsed = parsePairSlug(slug);

  const siteA = SITES.find((s) => s.id === (known?.siteAId ?? parsed?.siteAId));
  const siteB = SITES.find((s) => s.id === (known?.siteBId ?? parsed?.siteBId));

  const nameA = siteA ? siteA.name : 'Platform A';
  const nameB = siteB ? siteB.name : 'Platform B';
  const rankA = siteA ? `#${siteA.rank}` : 'N/A';
  const rankB = siteB ? `#${siteB.rank}` : 'N/A';
  const baselineA = siteA ? siteA.baseline : 'N/A';
  const baselineB = siteB ? siteB.baseline : 'N/A';
  const colorA = siteA ? siteA.color : '#4285F4';
  const colorB = siteB ? siteB.color : '#01f1e2';
  const logoA = siteA ? siteA.logo : 'A';
  const logoB = siteB ? siteB.logo : 'B';

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
        {/* Top Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '35px',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(130, 200, 229, 0.15)',
              border: '1px solid rgba(130, 200, 229, 0.3)',
              color: '#82c8e5',
              fontSize: '13px',
              fontWeight: 800,
              padding: '6px 16px',
              borderRadius: '20px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            REAL-TIME TRAFFIC BATTLE ({CURRENT_YEAR})
          </div>
        </div>

        {/* Main Comparison Container Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.025)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px 50px',
            width: '1080px',
          }}
        >
          {/* Site A Side */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorA,
                color: colorA === '#ffffff' ? '#111111' : '#ffffff',
                fontWeight: 900,
                fontSize: '36px',
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                marginBottom: '16px',
              }}
            >
              {logoA}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '6px', textAlign: 'center' }}>
              {nameA}
            </div>
            <div style={{ fontSize: '18px', color: '#82c8e5', fontWeight: 700, marginBottom: '14px' }}>
              {rankA} Global
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 20px',
                borderRadius: '12px',
              }}
            >
              {baselineA}
            </div>
          </div>

          {/* VS Center Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0047ab',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '22px',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 20px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            VS
          </div>

          {/* Site B Side */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorB,
                color: colorB === '#ffffff' ? '#111111' : '#ffffff',
                fontWeight: 900,
                fontSize: '36px',
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                marginBottom: '16px',
              }}
            >
              {logoB}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '6px', textAlign: 'center' }}>
              {nameB}
            </div>
            <div style={{ fontSize: '18px', color: '#82c8e5', fontWeight: 700, marginBottom: '14px' }}>
              {rankB} Global
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 20px',
                borderRadius: '12px',
              }}
            >
              {baselineB}
            </div>
          </div>
        </div>

        {/* Footer Brand Signature */}
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
          <span style={{ color: '#82c8e5', fontWeight: 700 }}>PULSE ANALYTICS</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
