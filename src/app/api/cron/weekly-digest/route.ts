import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWeeklyReport } from '../../../report/data/reportGenerator';
import { getCurrentWeekSlug } from '../../../../lib/weekSlug';
import {
  sendWeeklyDigestBatch,
  renderWeeklyDigestHtml,
} from '../../../../lib/emailDigest';
import { cronAuthError } from '../../../../lib/auth';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

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

async function handleWeeklyDigest(request: Request) {
  const url = new URL(request.url);

  const authError = cronAuthError(request);
  if (authError) return authError;

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

    // 3. Dispatch Idempotency Lock Check
    const force = url.searchParams.get('force') === 'true';
    if (!testRecipient) {
      try {
        const { data: snapshotData } = await supabase
          .from('weekly_snapshots')
          .select('digest_dispatched_at, digest_recipient_count')
          .eq('week_slug', report.slug)
          .single();

        if (snapshotData?.digest_dispatched_at && !force) {
          return NextResponse.json({
            success: true,
            message: 'Weekly digest already dispatched for this report snapshot',
            week: report.slug,
            dispatchedAt: snapshotData.digest_dispatched_at,
            recipientCount: snapshotData.digest_recipient_count,
            skipped: true,
          });
        }
      } catch (lockCheckErr) {
        console.warn('[WeeklyDigest Cron] Snapshot lock check exception:', lockCheckErr);
      }
    }

    // 4. Retrieve subscribers via PostgREST Cursor Pagination (eliminates 1,000-row limit)
    let recipientEmails: string[] = [];

    if (testRecipient) {
      recipientEmails = [testRecipient.trim()];
    } else {
      const PAGE_SIZE = 1000;
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const to = from + PAGE_SIZE - 1;
        const { data: subs, error: subError } = await supabase
          .from('newsletter_subscribers')
          .select('email')
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .range(from, to);

        if (subError) {
          console.error('[WeeklyDigest Cron] Failed to fetch subscribers:', subError);
          return NextResponse.json(
            { success: false, error: 'Failed to query newsletter subscribers' },
            { status: 500 }
          );
        }

        if (!subs || subs.length === 0) {
          hasMore = false;
        } else {
          for (const s of subs) {
            if (s.email) recipientEmails.push(s.email.trim());
          }
          if (subs.length < PAGE_SIZE) {
            hasMore = false;
          } else {
            from += PAGE_SIZE;
          }
        }
      }
    }

    // Deduplicate recipient emails
    recipientEmails = Array.from(new Set(recipientEmails));

    if (recipientEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers to dispatch to.',
        week: report.slug,
        subscribersCount: 0,
        dispatched: 0,
      });
    }

    // 5. Batch dispatch emails via Resend Batch API (100-recipient chunks with 550ms pacing)
    const fromOverride = url.searchParams.get('from') || undefined;
    const batchResult = await sendWeeklyDigestBatch(
      recipientEmails,
      report,
      undefined,
      fromOverride
    );

    // 6. Record Dispatch Idempotency Lock
    if (!testRecipient && batchResult.dispatched > 0) {
      try {
        await supabase
          .from('weekly_snapshots')
          .update({
            digest_dispatched_at: new Date().toISOString(),
            digest_recipient_count: batchResult.dispatched,
          })
          .eq('week_slug', report.slug);
      } catch (lockUpdateErr) {
        console.warn('[WeeklyDigest Cron] Failed to update digest lock:', lockUpdateErr);
      }
    }

    return NextResponse.json({
      success: true,
      week: report.slug,
      headline: report.headline,
      subscribersCount: recipientEmails.length,
      dispatched: batchResult.dispatched,
      failed: batchResult.failed,
      isDryRun: batchResult.isDryRun,
      errors: batchResult.errors?.slice(0, 50),
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
