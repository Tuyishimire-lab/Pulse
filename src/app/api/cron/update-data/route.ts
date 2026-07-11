import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase';

export async function GET(request: Request) {
  // 1. Authorize Cron trigger (Vercel automatically sets CRON_SECRET)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, message: 'Database client is not configured' },
      { status: 500 }
    );
  }

  try {
    // 2. Fetch all current sites
    const { data: sites, error: fetchError } = await supabase
      .from('sites')
      .select('id', 'rate', 'progress')
      .order('rank', { ascending: true });

    if (fetchError || !sites) {
      console.error('Cron: Failed to fetch sites:', fetchError);
      return NextResponse.json(
        { success: false, error: fetchError?.message || 'No sites found' },
        { status: 500 }
      );
    }

    const currentHour = new Date().getHours();
    
    // 3. Construct new history nodes for each site (circadian wave + noise)
    const historyInsertions = sites.map((site: any) => {
      const baseCircadian = Math.sin((currentHour - 9) / 24 * 2 * Math.PI) * 28;
      const noise = (Math.random() - 0.5) * 14;
      const visitsPercentage = Math.max(20, Math.min(98, Math.round(62 + baseCircadian + noise)));

      return {
        site_id: site.id,
        visits_percentage: visitsPercentage,
        timestamp: new Date().toISOString()
      };
    });

    // Bulk insert history nodes
    const { error: historyError } = await supabase
      .from('traffic_history')
      .insert(historyInsertions);

    if (historyError) {
      console.error('Cron: Failed to insert history:', historyError);
      return NextResponse.json({ success: false, error: historyError.message }, { status: 500 });
    }

    // 4. Update counter rates slightly to simulate live fluctuations (-5 to +5 visits/second)
    const rateUpdates = sites.map((site: any) => {
      const variation = Math.floor((Math.random() - 0.5) * 10);
      const newRate = Math.max(1, site.rate + variation);
      return supabase
        .from('sites')
        .update({ rate: newRate })
        .eq('id', site.id);
    });

    // Run updates in parallel chunks to avoid connection exhaustion
    const chunkSize = 20;
    for (let i = 0; i < rateUpdates.length; i += chunkSize) {
      const chunk = rateUpdates.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }

    // 5. Database maintenance: delete records older than 7 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const { error: deleteError, count: deletedCount } = await supabase
      .from('traffic_history')
      .delete({ count: 'exact' })
      .lt('timestamp', cutoffDate.toISOString());

    if (deleteError) {
      console.error('Cron: Failed to clean up database history:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: 'Database updated successfully',
      addedNodes: sites.length,
      deletedNodes: deletedCount || 0
    });

  } catch (error: any) {
    console.error('Cron Exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
