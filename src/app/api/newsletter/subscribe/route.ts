import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const source = typeof body.source === 'string' ? body.source.trim() : 'landing_page';

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database configuration missing.' },
        { status: 500 }
      );
    }

    // Check if subscriber already exists
    const { data: existing, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status')
      .eq('email', email)
      .maybeSingle();

    if (findError) {
      console.error('Error finding subscriber:', findError);
      return NextResponse.json(
        { success: false, message: 'Unable to process subscription right now.' },
        { status: 500 }
      );
    }

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to the Pulse Weekly Traffic Digest.',
          alreadySubscribed: true,
        });
      }

      // Reactivate unsubscribed user
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'active',
          subscribed_at: new Date().toISOString(),
          source,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error reactivating subscriber:', updateError);
        return NextResponse.json(
          { success: false, message: 'Failed to reactivate subscription.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.',
      });
    }

    // Insert brand new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        status: 'active',
        source,
        subscribed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to save subscription.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed to Pulse Weekly Traffic Digest.',
    });
  } catch (err) {
    console.error('Unexpected subscription error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email query parameter required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database configuration missing.' },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email);

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to unsubscribe.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully from Pulse Weekly Traffic Digest.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
