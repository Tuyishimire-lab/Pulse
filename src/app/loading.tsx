/**
 * Next.js loading UI — shown while page.tsx JS bundle downloads.
 * Only the site card grid shimmers; header renders from static HTML immediately.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center">
      {/* Mesh gradient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(0, 71, 171, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(130, 200, 229, 0.18) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 0, 128, 0.25) 0%, transparent 60%)
          `,
        }}
      />

      {/* Header placeholder (static — no shimmer) */}
      <header className="relative z-10 flex flex-col items-center w-full max-w-[700px] text-center pt-8 pb-6 px-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="pulse-dot" />
          <h1 className="m-0 text-[2.8rem] font-extrabold tracking-tight bg-gradient-to-r from-white to-[#82c8e5] bg-clip-text text-transparent">
            Pulse
          </h1>
        </div>
        <p className="text-[#6d8196] text-lg font-normal m-0 mb-4">
          Real Time Global Web Traffic Stream
        </p>
      </header>

      {/* Site card grid skeleton */}
      <main className="relative z-10 w-full max-w-[1200px] px-6 pb-16">
        {/* Search bar shimmer */}
        <div className="w-full h-12 rounded-2xl bg-white/[0.04] animate-pulse mb-6 mt-2" />

        {/* Category pills shimmer */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-white/[0.04] animate-pulse"
              style={{ width: `${60 + (i % 3) * 20}px`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        {/* Card grid shimmer — 12 placeholder cards */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-4 animate-pulse"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Card header: rank badge + logo */}
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 rounded-full bg-white/[0.06]" />
                <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
              </div>
              {/* Site name */}
              <div className="h-5 w-3/4 rounded-lg bg-white/[0.06]" />
              {/* URL */}
              <div className="h-3 w-1/2 rounded-lg bg-white/[0.04]" />
              {/* Counter label */}
              <div className="h-3 w-28 rounded-lg bg-white/[0.04]" />
              {/* Counter number */}
              <div className="h-8 w-full rounded-xl bg-white/[0.06]" />
              {/* Stats row */}
              <div className="flex justify-between">
                <div className="h-3 w-1/3 rounded-lg bg-white/[0.04]" />
                <div className="h-3 w-1/4 rounded-lg bg-white/[0.04]" />
              </div>
              {/* Progress bar */}
              <div className="h-1 w-full rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
