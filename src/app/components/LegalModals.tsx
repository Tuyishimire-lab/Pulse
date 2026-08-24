'use client';

import React, { useEffect } from 'react';

interface LegalModalsProps {
  showPrivacyModal: boolean;
  showTermsModal: boolean;
  showMethodologyModal?: boolean;
  onClosePrivacy: () => void;
  onCloseTerms: () => void;
  onCloseMethodology?: () => void;
}

/**
 * Privacy Policy, Terms of Service, and Data Methodology modal overlays.
 */
export default function LegalModals({
  showPrivacyModal,
  showTermsModal,
  showMethodologyModal = false,
  onClosePrivacy,
  onCloseTerms,
  onCloseMethodology = () => {},
}: LegalModalsProps) {
  // Close any open modal on Escape key press
  useEffect(() => {
    if (!showPrivacyModal && !showTermsModal && !showMethodologyModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showPrivacyModal) onClosePrivacy();
      else if (showTermsModal) onCloseTerms();
      else if (showMethodologyModal) onCloseMethodology();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showPrivacyModal, showTermsModal, showMethodologyModal, onClosePrivacy, onCloseTerms, onCloseMethodology]);

  return (
    <>
      {/* Privacy Policy glassmorphic popup overlay */}
      {showPrivacyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Privacy Policy"
          className="modal-overlay flex items-center justify-center animate-fadeIn z-[100]"
          onClick={onClosePrivacy}
        >
          <div className="modal-content max-w-[550px] w-full p-8 rounded-3xl border border-white/10 text-left mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold m-0 text-white">Privacy Policy</h2>
              <button autoFocus className="modal-close-btn" onClick={onClosePrivacy}>
                &times;
              </button>
            </div>
            <div className="text-sm text-[#cbd5e1] leading-relaxed mt-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2">
              <p><strong>1. Introduction:</strong> Welcome to Pulse. We respect your privacy and do not collect, store, or sell any of your personal identifiers or browsing histories.</p>
              <p><strong>2. Local Storage Usage:</strong> This application uses your browser&apos;s local storage to save your personal watchlist and custom tracked domains. This data is stored entirely on your local machine and is never transmitted to our servers or third-party networks.</p>
              <p><strong>3. Analytics:</strong> We use privacy-focused analytics packages to monitor overall site views and page performance. No personal tracking cookies are used.</p>
              <p><strong>4. Third-Party Connections:</strong> Brand icons and logos are fetched dynamically from public URL endpoints (Google Favicon API). No credentials or user headers are shared with these gateways.</p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service glassmorphic popup overlay */}
      {showTermsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Terms of Service"
          className="modal-overlay flex items-center justify-center animate-fadeIn z-[100]"
          onClick={onCloseTerms}
        >
          <div className="modal-content max-w-[550px] w-full p-8 rounded-3xl border border-white/10 text-left mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold m-0 text-white">Terms of Service</h2>
              <button autoFocus className="modal-close-btn" onClick={onCloseTerms}>
                &times;
              </button>
            </div>
            <div className="text-sm text-[#cbd5e1] leading-relaxed mt-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2">
              <p><strong>1. Agreement to Terms:</strong> By accessing Pulse, you agree to comply with and be bound by these terms.</p>
              <p><strong>2. Data Methodology:</strong> Pulse data is not a direct server tap into internal corporate engineering load balancers (as no third-party website on the internet has access to private internal server logs of third-party companies). Like Similarweb, Worldometer, or Statista, Pulse utilizes statistical modeling - specifically, Cloudflare Radar DNS telemetry, Tranco multi-source rankings, Open PageRank authority scores, and Groq AI momentum signals.</p>
              <p><strong>3. Intellectual Property:</strong> Company brand names, domain URLs, and registered trademarks belong to their respective owners. Brand colors and logo assets are used strictly for informational identification purposes.</p>
              <p><strong>4. Limitations of Liability:</strong> Under no circumstances shall Pulse be liable for any direct or indirect business decisions made based on the estimations shown on this dashboard.</p>
            </div>
          </div>
        </div>
      )}

      {/* Data & Methodology Disclaimer Popup Overlay */}
      {showMethodologyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Data & Methodology Disclaimer"
          className="modal-overlay flex items-center justify-center animate-fadeIn z-[100]"
          onClick={onCloseMethodology}
        >
          <div className="modal-content max-w-[580px] w-full p-8 rounded-3xl border border-white/10 text-left mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold m-0 text-white">Data &amp; Methodology Disclaimer</h2>
              <button autoFocus className="modal-close-btn" onClick={onCloseMethodology}>
                &times;
              </button>
            </div>
            <div className="text-sm text-[#cbd5e1] leading-relaxed mt-4 flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-2">
              <p>
                <strong>Statistical Modeling &amp; Panel Telemetry:</strong> Pulse metrics are not a direct server tap into internal corporate load balancers. No third-party platform on the internet has access to private internal server logs of third-party companies.
              </p>
              <p>
                <strong>Industry Standard Benchmark Modeling:</strong> Similar to platforms such as Worldometer and Statista, Pulse utilizes the Pulse Traffic Index (PTI) - a multi-signal statistical engine combining Cloudflare Radar DNS telemetry, Tranco rankings, Open PageRank authority scores, and Groq AI momentum signals. The methodology is publicly documented at <a href="/methodology" className="underline">pulstraffic.com/methodology</a>.
              </p>
              <p>
                <strong>Real-Time Ticker Physics:</strong> Live visitor counters on Pulse represent high-precision mathematical rate calculations (Rate = Monthly Visits / 2,628,000 seconds) designed to illustrate global visit velocity and platform scale in real time.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
