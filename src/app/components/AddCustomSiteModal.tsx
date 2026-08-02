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
  if (!show) return null;

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
            <label className="form-label">Website Name</label>
            <input
              type="text"
              required
              placeholder="e.g. My Portfolio"
              value={newSiteName}
              onChange={(e) => onNameChange(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Domain URL</label>
            <input
              type="text"
              required
              placeholder="e.g. mywebsite.com"
              value={newSiteUrl}
              onChange={(e) => onUrlChange(e.target.value)}
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
