'use client';

import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-black text-white antialiased min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111111] border border-white/10 p-8 rounded-xl shadow-2xl flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight">System Failure</h2>
          
          <p className="text-gray-400 text-sm">
            A critical error occurred while rendering this page. The system administrator has been notified.
          </p>

          <div className="bg-black/50 border border-white/5 p-4 rounded-lg w-full text-left overflow-hidden text-ellipsis">
            <p className="text-xs font-mono text-gray-500 break-words">
              {error.message || 'Unknown error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-600 mt-2">Error ID: {error.digest}</p>
            )}
          </div>

          <button
            onClick={() => reset()}
            className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-white/20 outline-none"
          >
            Attempt Recovery
          </button>
        </div>
      </body>
    </html>
  );
}
