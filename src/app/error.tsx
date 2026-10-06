'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold tracking-tight text-white">Something went wrong!</h2>
      
      <p className="text-gray-400 max-w-lg">
        We're sorry, but we encountered an unexpected error while trying to load this page. 
        You can try refreshing or go back home.
      </p>

      {process.env.NODE_ENV !== 'production' && (
        <div className="bg-black/50 border border-white/10 p-4 rounded-lg w-full max-w-2xl text-left overflow-auto mt-4">
          <p className="text-sm font-mono text-red-400 whitespace-pre-wrap">
            {error.message || 'Unknown error occurred'}
          </p>
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => reset()}
          className="bg-white text-black font-semibold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
        <a 
          href="/"
          className="bg-white/10 text-white font-semibold py-2 px-6 rounded-lg hover:bg-white/20 transition-colors"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
