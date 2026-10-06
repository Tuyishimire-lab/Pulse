/**
 * Pulse Weekly Traffic Digest - Email Template and Dispatch Engine
 *
 * Generates an executive, uncluttered, highly-readable, fully responsive
 * HTML and plaintext email digest from WeeklyReport data and dispatches
 * them via the Resend REST API.
 */

import { WeeklyReport } from '../app/report/data/reportGenerator';

export interface EmailDispatchResult {
  success: boolean;
  id?: string;
  error?: string;
  dryRun?: boolean;
}

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://www.pulstraffic.com';
}

/**
 * Compiles an executive, responsive HTML email for the weekly digest.
 * Optimized for desktop and mobile email clients with fluid grid rules.
 * Strictly adheres to clean styling: zero emojis, zero em-dashes.
 */
export function renderWeeklyDigestHtml(
  report: WeeklyReport,
  recipientEmail: string,
  appUrl: string = getAppBaseUrl()
): string {
  const reportUrl = `${appUrl}/report/${report.slug}`;
  const unsubscribeUrl = `${appUrl}/api/newsletter/subscribe?email=${encodeURIComponent(recipientEmail)}`;

  // Top movers list: clean, airy rows with responsive wrapping
  const topMoversList = (report.topMovers || []).slice(0, 5).map((mover, idx) => {
    const isUp = mover.rankChange > 0;
    const isDown = mover.rankChange < 0;
    const badgeColor = isUp ? '#059669' : isDown ? '#dc2626' : '#64748b';
    const badgeBg = isUp ? '#ecfdf5' : isDown ? '#fef2f2' : '#f1f5f9';
    const changeLabel = isUp ? `+${mover.rankChange}` : isDown ? `${mover.rankChange}` : '0';
    const trafficChange = mover.trafficDelta > 0 ? `+${mover.trafficDelta.toFixed(1)}%` : `${mover.trafficDelta.toFixed(1)}%`;
    const isLast = idx === Math.min(4, (report.topMovers || []).length - 1);

    return `
      <div style="padding: 13px 0; ${isLast ? '' : 'border-bottom: 1px solid #f1f5f9;'}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="38" valign="top">
              <span style="display: inline-block; width: 32px; text-align: center; padding: 4px 0; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: ${badgeColor}; background-color: ${badgeBg};">
                ${changeLabel}
              </span>
            </td>
            <td valign="top" style="padding-left: 8px; padding-right: 8px;">
              <div>
                <a href="${mover.site.url}" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #0f172a; text-decoration: none;">
                  ${mover.site.name}
                </a>
                <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; margin-left: 6px;">
                  ${mover.site.baseline} / mo
                </span>
                <span style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 600; color: #64748b; background-color: #f1f5f9; padding: 1px 6px; border-radius: 4px; margin-left: 6px;">
                  ${mover.confidence?.label || 'Modeled'}
                </span>
              </div>
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #475569; line-height: 1.4; margin-top: 3px;">
                ${mover.highlight}
              </div>
            </td>
            <td width="64" align="right" valign="top">
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: ${mover.trafficDelta >= 0 ? '#10b981' : '#dc2626'}; white-space: nowrap;">
                ${trafficChange}
              </span>
            </td>
          </tr>
        </table>
      </div>
    `;
  }).join('');

  // 2x2 Sector Breakdown grid: balanced on desktop, comfortable on mobile
  const sectors = (report.categoryBreakdown || []).slice(0, 4);
  const row1 = sectors.slice(0, 2);
  const row2 = sectors.slice(2, 4);

  const renderSectorCard = (cat?: { label: string; sharePercent?: number; totalBaseline: string }) => {
    if (!cat) return '';
    return `
      <td width="48%" style="padding: 10px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">
              ${cat.label}
            </td>
            <td align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; color: #0f172a;">
              ${cat.sharePercent || 0}%
            </td>
          </tr>
          <tr>
            <td colspan="2" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #94a3b8; padding-top: 2px;">
              ${cat.totalBaseline}
            </td>
          </tr>
        </table>
      </td>
    `;
  };

  const sectorsTableHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        ${renderSectorCard(row1[0])}
        <td width="4%"></td>
        ${renderSectorCard(row1[1])}
      </tr>
      ${row2.length > 0 ? `
      <tr><td height="8" colspan="3"></td></tr>
      <tr>
        ${renderSectorCard(row2[0])}
        <td width="4%"></td>
        ${renderSectorCard(row2[1])}
      </tr>` : ''}
    </table>
  `;

  // Featured stories
  const storiesHtml = (report.stories || []).slice(0, 2).map((story) => {
    return `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 14px;">
        <span style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #0369a1; background-color: #e0f2fe; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px;">
          ${story.tag || 'MARKET INSIGHT'}
        </span>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.35; margin-bottom: 6px;">
          ${story.title}
        </div>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #334155; line-height: 1.55;">
          ${story.summary}
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pulse Weekly Traffic Digest</title>
  <style type="text/css">
    /* Email client compatibility rules */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* Responsive adjustments for phones and tablets */
    @media only screen and (max-width: 580px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
      }
      .email-pad {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .header-pad {
        padding: 18px 18px 14px 18px !important;
      }
      .stat-stack {
        display: block !important;
        width: 100% !important;
        margin-bottom: 8px !important;
        box-sizing: border-box !important;
      }
      .stat-spacer {
        display: none !important;
      }
      .headline-text {
        font-size: 20px !important;
        line-height: 1.35 !important;
      }
      .subheadline-text {
        font-size: 13px !important;
        line-height: 1.5 !important;
      }
      .cta-button {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        text-align: center !important;
        padding: 14px 12px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; margin: 0; padding: 24px 8px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table class="email-container" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td class="header-pad" style="padding: 24px 28px 18px 28px; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 17px; font-weight: 900; letter-spacing: -0.01em; color: #0f172a;">
                      PULSE <span style="font-weight: 500; font-size: 12px; color: #0284c7; letter-spacing: 0.08em; text-transform: uppercase; margin-left: 4px;">/ Intelligence</span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; color: #64748b; background-color: #f1f5f9; padding: 3px 9px; border-radius: 20px;">
                      ${report.slug.toUpperCase()} : ${report.publishedDate}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Lead -->
          <tr>
            <td class="email-pad" style="padding: 28px 28px 20px 28px;">
              <div class="headline-text" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.01em;">
                ${report.headline}
              </div>
              <div class="subheadline-text" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #475569; line-height: 1.55; margin-top: 8px;">
                ${report.subheadline}
              </div>
            </td>
          </tr>

          <!-- Key Vital Signs -->
          <tr>
            <td class="email-pad" style="padding: 0 28px 20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="stat-stack" width="32%" align="center" style="padding: 14px 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
                      Health Score
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 19px; font-weight: 800; color: ${report.healthContext?.statusColor || '#10b981'}; margin-top: 3px;">
                      ${report.internetHealthScore} <span style="font-size: 11px; font-weight: 600; color: #94a3b8;">/ 100</span>
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 600; color: #64748b; margin-top: 2px;">
                      ${report.healthContext?.statusBand || 'Nominal'} (8-wk: ${report.healthContext?.historicalAverage || 76})
                    </div>
                  </td>
                  <td class="stat-spacer" width="2%"></td>
                  <td class="stat-stack" width="32%" align="center" style="padding: 14px 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
                      Top Velocity
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 19px; font-weight: 800; color: #0f172a; margin-top: 3px;">
                      ${report.totalTopSitesVisitsPerSec.toLocaleString()} <span style="font-size: 11px; font-weight: 600; color: #64748b;">req/s</span>
                    </div>
                  </td>
                  <td class="stat-spacer" width="2%"></td>
                  <td class="stat-stack" width="32%" align="center" style="padding: 14px 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
                      7-Day Trend
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 19px; font-weight: 800; color: ${report.trafficChangePercent >= 0 ? '#10b981' : '#dc2626'}; margin-top: 3px;">
                      ${report.trafficChangePercent >= 0 ? '+' : ''}${report.trafficChangePercent.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Search & AI Convergence Index Card -->
          <tr>
            <td class="email-pad" style="padding: 0 28px 24px 28px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px 18px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <span style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #0284c7; background-color: #e0f2fe; padding: 2px 7px; border-radius: 4px; margin-bottom: 5px;">
                        Structural Shift
                      </span>
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #0f172a;">
                        Search &amp; AI Convergence Ratio: <span style="color: #10b981;">${report.aiSearchConvergence?.ratioPercent || 0}%</span>
                      </div>
                    </td>
                    <td align="right" valign="top">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: #10b981;">
                        ${(report.aiSearchConvergence?.aiGrowthPercent ?? 0) >= 0 ? '+' : ''}${report.aiSearchConvergence?.aiGrowthPercent || 0}% AI WoW
                      </span>
                    </td>
                  </tr>
                </table>
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #475569; line-height: 1.45; margin-top: 6px;">
                  ${report.aiSearchConvergence?.convergenceNarrative || ''}
                </div>
                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748b;">
                  Track AI search citations &amp; agent readiness on <a href="https://www.citeroute.com" target="_blank" style="color: #05AD98; font-weight: 700; text-decoration: none;">CiteRoute &rarr;</a>
                </div>
              </div>
            </td>
          </tr>

          <!-- Top Movers Section -->
          <tr>
            <td class="email-pad" style="padding: 0 28px 24px 28px;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px;">
                Top Movers of the Week
              </div>
              ${topMoversList}
            </td>
          </tr>

          <!-- Sector Breakdown Section -->
          <tr>
            <td class="email-pad" style="padding: 0 28px 24px 28px;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 10px;">
                Traffic Share by Sector
              </div>
              ${sectorsTableHtml}
            </td>
          </tr>

          <!-- Regional Spotlight Section -->
          <tr>
            <td class="email-pad" style="padding: 0 28px 24px 28px;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px;">
                Regional Intelligence Spotlight
              </div>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px 18px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a;">
                      ${report.regionalSpotlight?.region || 'Global Markets'} : ${report.regionalSpotlight?.keyDriver || 'Velocity Growth'}
                    </td>
                    <td align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: ${(report.regionalSpotlight?.growthRate || '').startsWith('-') ? '#ef4444' : '#10b981'};">
                      ${report.regionalSpotlight?.growthRate || ''}
                    </td>
                  </tr>
                </table>
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #475569; line-height: 1.45; margin-top: 5px;">
                  ${report.regionalSpotlight?.detail || ''}
                </div>
              </div>
            </td>
          </tr>

          <!-- Executive Highlights Section -->
          <tr>
            <td class="email-pad" style="padding: 0 28px 28px 28px;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px;">
                Executive Highlights
              </div>
              ${storiesHtml}

              <!-- Primary CTA Button -->
              <div style="text-align: center; margin-top: 26px;">
                <a href="${reportUrl}" class="cta-button" style="display: inline-block; padding: 13px 28px; background-color: #0f172a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; border-radius: 8px; text-decoration: none;">
                  Explore Full Interactive Report
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-pad" style="padding: 22px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; line-height: 1.5;">
                You received this weekly briefing because you subscribed to the Pulse Weekly Traffic Digest.
                <br>
                Pulse Traffic Intelligence : Global Domain Analytics &amp; Velocity Tracker
              </div>
              <div style="margin-top: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">
                  Unsubscribe from this digest
                </a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Plain text fallback representation for text-only email clients.
 */
export function renderWeeklyDigestText(
  report: WeeklyReport,
  recipientEmail: string,
  appUrl: string = getAppBaseUrl()
): string {
  const reportUrl = `${appUrl}/report/${report.slug}`;
  const unsubscribeUrl = `${appUrl}/api/newsletter/subscribe?email=${encodeURIComponent(recipientEmail)}`;

  const moversText = (report.topMovers || []).slice(0, 5).map((m) => {
    const shift = m.rankChange > 0 ? `+${m.rankChange}` : `${m.rankChange}`;
    const conf = m.confidence?.label ? ` [${m.confidence.label}]` : '';
    return `- ${m.site.name}: Rank ${shift}, Traffic ${m.trafficDelta >= 0 ? '+' : ''}${m.trafficDelta.toFixed(1)}%${conf} (${m.highlight})`;
  }).join('\n');

  const storiesText = (report.stories || []).slice(0, 2).map((s) => {
    return `[${s.tag.toUpperCase()}] ${s.title}\n${s.summary}\n`;
  }).join('\n');

  return `PULSE WEEKLY TRAFFIC DIGEST
Week: ${report.slug} (${report.publishedDate})
--------------------------------------------------
${report.headline}
${report.subheadline}

GLOBAL METRICS:
- Internet Health: ${report.internetHealthScore} / 100 (${report.healthContext?.statusBand || 'Nominal'}, 8-wk avg: ${report.healthContext?.historicalAverage || 76})
- Top Sites Total Velocity: ${report.totalTopSitesVisitsPerSec.toLocaleString()} req/s
- 7-Day Trend: ${report.trafficChangePercent >= 0 ? '+' : ''}${report.trafficChangePercent.toFixed(1)}%

SEARCH & AI CONVERGENCE:
- AI-to-Search Ratio: ${report.aiSearchConvergence?.ratioPercent || 0}%
- ${report.aiSearchConvergence?.convergenceNarrative || ''}

REGIONAL SPOTLIGHT:
- ${report.regionalSpotlight?.region || 'Global'}: ${report.regionalSpotlight?.keyDriver || ''} (${report.regionalSpotlight?.growthRate || ''})
- ${report.regionalSpotlight?.detail || ''}

TOP MOVERS:
${moversText}

HIGHLIGHTS:
${storiesText}

Read the full interactive analysis:
${reportUrl}

--------------------------------------------------
To unsubscribe from this digest:
${unsubscribeUrl}
`;
}

/**
 * Dispatches a weekly digest email to a single recipient.
 * If RESEND_API_KEY is not defined, runs in simulated dry-run mode.
 */
export async function sendWeeklyDigestEmail(
  recipientEmail: string,
  report: WeeklyReport,
  appUrl?: string,
  fromOverride?: string
): Promise<EmailDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const html = renderWeeklyDigestHtml(report, recipientEmail, appUrl);
  const text = renderWeeklyDigestText(report, recipientEmail, appUrl);
  const subject = `Pulse Weekly Digest: ${report.headline}`;

  if (!apiKey) {
    // Graceful dry-run fallback
    console.log(`[EmailDigest Dry-Run] Dispatch simulated for ${recipientEmail}. Subject: "${subject}"`);
    return {
      success: true,
      dryRun: true,
      id: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };
  }

  const fromEmail = fromOverride || process.env.EMAIL_FROM || 'Pulse Intelligence <digest@pulstraffic.com>';

  const maxAttempts = 3;
  let lastError = 'Unknown dispatch exception';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: recipientEmail,
          subject,
          html,
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`[EmailDigest Error] Failed to send email to ${recipientEmail} (attempt ${attempt}):`, data);
        return {
          success: false,
          error: data.message || 'Resend API dispatch failed',
        };
      }

      return {
        success: true,
        id: data.id,
        dryRun: false,
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : 'Unknown dispatch exception';
      console.warn(`[EmailDigest Retry] Attempt ${attempt} failed for ${recipientEmail}: ${lastError}`);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return {
    success: false,
    error: lastError,
  };
}
