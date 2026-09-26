import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWeeklyReport } from '../../../report/data/reportGenerator';
import { getCurrentWeekSlug } from '../../../../lib/weekSlug';
import { sendWeeklyDigestEmail, renderWeeklyDigestHtml } from '../../../../lib/emailDigest';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);

function authorizeCronRequest(request: Request, url: URL): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const isDev = process.env.NODE_ENV !== 'production';

  // In development, allow testing without credentials if requested
  if (isDev && (url.searchParams.get('test') === 'true' || url.searchParams.get('dryRun') === 'true')) {
    return true;
  }

  // If secret is set, authorize via header or query param
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader === `Bearer ${cronSecret}`) return true;
    if (url.searchParams.get('secret') === cronSecret) return true;
  }

  // Allow local requests in development
  if (isDev) {
    return true;
  }

  return false;
}

async function handleWeeklyDigest(request: Request) {
  const url = new URL(request.url);

  if (!authorizeCronRequest(request, url)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: invalid or missing CRON_SECRET' },
      { status: 401 }
    );
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Database client is not configured' },
      { status: 500 }
    );
  }

  try {
    // 1. Resolve target week and generate report
    const requestedWeek = url.searchParams.get('week') || getCurrentWeekSlug();
    const report = await generateWeeklyReport(requestedWeek);

    if (!report) {
      return NextResponse.json(
        { success: false, error: `Could not generate report for week ${requestedWeek}` },
        { status: 500 }
      );
    }

    // 2. Check for single recipient test mode or preview mode
    const previewOnly = url.searchParams.get('preview') === 'true';
    const testRecipient = url.searchParams.get('testEmail');

    if (previewOnly) {
      const sampleEmail = testRecipient || 'subscriber@example.com';
      const html = renderWeeklyDigestHtml(report, sampleEmail);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 3. Retrieve subscribers
    let recipientEmails: string[] = [];

    if (testRecipient) {
      recipientEmails = [testRecipient];
    } else {
      const { data: subs, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('status', 'active');

      if (subError) {
        console.error('[WeeklyDigest Cron] Failed to fetch subscribers:', subError);
        return NextResponse.json(
          { success: false, error: 'Failed to query newsletter subscribers' },
          { status: 500 }
        );
      }

      recipientEmails = (subs || []).map((s: { email: string }) => s.email).filter(Boolean);
    }

    if (recipientEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers to dispatch to.',
        week: report.slug,
        subscribersCount: 0,
        dispatched: 0,
      });
    }

    // 4. Batch dispatch emails
    const fromOverride = url.searchParams.get('from') || undefined;
    const results: { email: string; success: boolean; dryRun?: boolean; error?: string }[] = [];
    const concurrency = 5;

    for (let i = 0; i < recipientEmails.length; i += concurrency) {
      const chunk = recipientEmails.slice(i, i + concurrency);
      const chunkResults = await Promise.all(
        chunk.map(async (email) => {
          const res = await sendWeeklyDigestEmail(email, report, undefined, fromOverride);
          return {
            email,
            success: res.success,
            dryRun: res.dryRun,
            error: res.error,
          };
        })
      );
      results.push(...chunkResults);
    }

    const successfulCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;
    const isDryRun = results.some((r) => r.dryRun);

    return NextResponse.json({
      success: true,
      week: report.slug,
      headline: report.headline,
      subscribersCount: recipientEmails.length,
      dispatched: successfulCount,
      failed: errorCount,
      isDryRun,
      results: results.slice(0, 50),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown exception';
    console.error('[WeeklyDigest Cron Exception]:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleWeeklyDigest(request);
}

export async function POST(request: Request) {
  return handleWeeklyDigest(request);
}
