import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Pulse',
  description: 'Privacy policy and data handling guidelines for Pulse live global web traffic visualizer.',
  alternates: {
    canonical: 'https://www.pulstraffic.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center justify-between p-6 sm:p-12">
      <div className="w-full max-w-3xl border border-white/10 rounded-3xl bg-white/[0.02] p-8 sm:p-12 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-[#82c8e5] mt-1 font-semibold uppercase tracking-wider">Pulse Traffic Visualizer</p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
          >
            ← Back to App
          </Link>
        </div>

        <div className="space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Information Collection</h2>
            <p>
              Pulse respects visitor privacy. We do not require account registration, and we do not collect, store, or sell personally identifiable information (PII) such as names, email addresses, or phone numbers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Local Storage Usage</h2>
            <p>
              This application utilizes your browser&apos;s local storage (`localStorage`) exclusively to persist your personal watchlist selections and custom tracked domain preferences on your device. This data is stored locally and is never transmitted to external servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Analytics &amp; Cookies</h2>
            <p>
              We use privacy-focused performance analytics (Google Analytics &amp; Vercel Analytics) to aggregate pageview counts, device types, and geographic regions. No intrusive tracking cookies or personal profiling techniques are used.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Third-Party Connections</h2>
            <p>
              Brand favicons and logos are dynamically fetched from public CDN endpoints (Google Favicon API). No user credentials, authentication tokens, or personal request headers are shared with these external assets.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">5. Contact Information</h2>
            <p>
              For questions regarding this privacy policy or data handling practices, please contact us at privacy@pulstraffic.com.
            </p>
          </section>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-[#6d8196]">
          Last updated: August 2026 · www.pulstraffic.com
        </div>
      </div>
    </div>
  );
}
