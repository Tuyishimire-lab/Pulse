'use client';

import React from 'react';
import { SiteConfig, SITES } from '../data/sites';

interface AddCustomSiteModalProps {
  show: boolean;
  onClose: () => void;
  newSiteName: string;
  onNameChange: (v: string) => void;
  newSiteUrl: string;
  onUrlChange: (v: string) => void;
  newSiteCategory: string;
  onCategoryChange: (v: string) => void;
  newSiteBaseline: string;
  onBaselineChange: (v: string) => void;
  newSiteColor: string;
  onColorChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Modal form for adding a custom domain to track alongside built-in sites.
 */
export default function AddCustomSiteModal({
  show,
  onClose,
  newSiteName,
  onNameChange,
  newSiteUrl,
  onUrlChange,
  newSiteCategory,
  onCategoryChange,
  newSiteBaseline,
  onBaselineChange,
  newSiteColor,
  onColorChange,
  onSubmit,
}: AddCustomSiteModalProps) {
  const [isEstimating, setIsEstimating] = React.useState(false);
  const [estimateMsg, setEstimateMsg] = React.useState<string | null>(null);

  const handleAutoEstimate = async () => {
    if (!newSiteUrl) return;
    setIsEstimating(true);
    setEstimateMsg(null);
    try {
      const res = await fetch(`/api/estimate-domain?url=${encodeURIComponent(newSiteUrl)}`);
      const data = await res.json();
      if (data.success) {
        if (!newSiteName || newSiteName === 'My Portfolio') onNameChange(data.name);
        if (data.category) onCategoryChange(data.category);
        if (data.baseline) onBaselineChange(data.baseline);
        if (data.color) onColorChange(data.color);
        setEstimateMsg(`✓ Estimated: ${data.baseline} (${data.rate?.toLocaleString()} visits/s)`);
      } else {
        setEstimateMsg(data.error || 'Could not estimate domain');
      }
    } catch {
      setEstimateMsg('Estimator service unavailable');
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div
      className="modal-overlay flex items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content max-w-[500px] w-full p-8 rounded-3xl border border-white/10 mx-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <h2 className="text-xl font-bold m-0">Track Your Own Domain</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={onSubmit} className="custom-form-container">
          <div className="form-field">
            <label className="form-label">Domain URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. linear.app"
                value={newSiteUrl}
                onChange={(e) => onUrlChange(e.target.value)}
                className="form-input flex-1"
              />
              <button
                type="button"
                onClick={handleAutoEstimate}
                disabled={isEstimating || !newSiteUrl}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all whitespace-nowrap disabled:opacity-50"
              >
                {isEstimating ? 'Estimating...' : 'Auto-Estimate'}
              </button>
            </div>
            {estimateMsg && (
              <p className={`text-xs mt-1.5 ${estimateMsg.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {estimateMsg}
              </p>
            )}
          </div>

          <div className="form-field">
            <label className="form-label">Website Name</label>
            <input
              type="text"
              required
              placeholder="e.g. My Website"
              value={newSiteName}
              onChange={(e) => onNameChange(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group-row">
            <div className="form-field">
              <label className="form-label">Category</label>
              <select
                value={newSiteCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="form-select"
              >
                <option value="dev">Developer Tools</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="social">Social Media</option>
                <option value="entertainment">Entertainment</option>
                <option value="search">Search</option>
                <option value="ai">AI Assistants</option>
                <option value="reference">Reference</option>
                <option value="news">News &amp; Media</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Monthly Traffic</label>
              <select
                value={newSiteBaseline}
                onChange={(e) => onBaselineChange(e.target.value)}
                className="form-select"
              >
                {!['1M / mo', '5M / mo', '10M / mo', '50M / mo', '100M / mo', '500M / mo'].includes(newSiteBaseline) && (
                  <option value={newSiteBaseline}>{newSiteBaseline} (Estimated)</option>
                )}
                <option value="1M / mo">1 Million / mo</option>
                <option value="5M / mo">5 Million / mo</option>
                <option value="10M / mo">10 Million / mo</option>
                <option value="50M / mo">50 Million / mo</option>
                <option value="100M / mo">100 Million / mo</option>
                <option value="500M / mo">500 Million / mo</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Brand Color Highlight</label>
            <div className="flex gap-3 mt-1 items-center">
              <input
                type="color"
                value={newSiteColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-10 h-10 border border-white/10 rounded cursor-pointer bg-transparent"
              />
              <span className="text-xs text-[#94a3b8] font-mono">{newSiteColor.toUpperCase()}</span>
            </div>
          </div>

          <button type="submit" className="form-submit-btn">
            Launch Live Tracker
          </button>
        </form>
      </div>
    </div>
  );
}
