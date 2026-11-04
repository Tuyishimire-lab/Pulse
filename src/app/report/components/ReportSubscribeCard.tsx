'use client';

import React, { useState } from 'react';

export interface ReportSubscribeCardProps {
  className?: string;
  source?: string;
}

export default function ReportSubscribeCard({
  className = '',
  source = 'weekly_report_page',
}: ReportSubscribeCardProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, source }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Subscribed! You will receive the weekly digest every Monday.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  }

  return (
    <div
      className={`rounded-2xl p-6 bg-[#0c1220]/80 border border-white/[0.08] backdrop-blur-md relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#82c8e5]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#82c8e5] font-semibold">
            Weekly Intelligence Digest
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1.5 font-outfit">
          Stay Ahead of Macro Internet Shifts
        </h3>
        <p className="text-xs text-[#8ea1b4] mb-4 leading-relaxed max-w-xl">
          Get the Pulse Weekly Internet Report delivered directly to your inbox every Monday at 08:00 UTC.
          Macro traffic velocity, DNS routing health, search substitution shifts, and breakout platform tracking.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-medium">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-grow">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@institution.com"
                required
                disabled={status === 'loading'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs placeholder-[#6d8196] focus:outline-none focus:border-[#82c8e5]/60 focus:ring-1 focus:ring-[#82c8e5]/60 transition-all font-mono"
                aria-label="Email address for weekly report digest"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 rounded-xl bg-[#82c8e5] text-[#02020a] font-semibold text-xs hover:bg-[#a0d9f0] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5 text-[#02020a]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Subscribing...</span>
                </>
              ) : (
                <span>Subscribe Free</span>
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-[11px] text-rose-400 mt-2 font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{message}</span>
          </p>
        )}

        <div className="flex items-center gap-4 mt-3 text-[10px] text-[#6d8196]">
          <span>Free weekly executive brief</span>
          <span>•</span>
          <span>Zero spam</span>
          <span>•</span>
          <span>One-click unsubscribe</span>
        </div>
      </div>
    </div>
  );
}
