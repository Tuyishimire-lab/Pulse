'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface FaviconImageProps {
  url: string;
  logo: string;
  color: string;
  size?: number;
  priority?: boolean;
  className?: string;
  fallbackClassName?: string;
  rounded?: 'full' | '2xl' | 'xl' | 'lg' | 'md';
}

// Domains where Google s2/favicons needs a canonical host alias to return the right product icon
const FAVICON_DOMAIN_ALIASES: Record<string, string> = {
  'gemini.com': 'gemini.google.com',
  'copilot.microsoft.com': 'copilot.cloud.microsoft',
};

// Domains where Google s2/favicons returns a 404 default globe; serve from icon.horse instead
const ICON_HORSE_DOMAINS = new Set([
  'epicgames.com',
  'store.epicgames.com',
]);

export function resolveFaviconUrl(url: string, size = 64): { domain: string; primarySrc: string; fallbackSrc: string } {
  const rawDomain = (url || '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .trim()
    .toLowerCase();

  const domain = FAVICON_DOMAIN_ALIASES[rawDomain] ?? rawDomain;
  const fallbackSrc = `https://icon.horse/icon/${rawDomain || domain}`;
  const primarySrc = ICON_HORSE_DOMAINS.has(domain)
    ? fallbackSrc
    : `https://www.google.com/s2/favicons?sz=${size >= 96 ? '128' : '64'}&domain=${domain}`;

  return { domain, primarySrc, fallbackSrc };
}

/**
 * Displays a site's favicon fetched from Google's favicon API (with icon.horse fallback).
 * Falls back to a styled initial letter if the image fails to load.
 */
export default function FaviconImage({
  url,
  logo,
  color,
  size = 64,
  priority = false,
  className,
  fallbackClassName,
  rounded = 'full',
}: FaviconImageProps) {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'monogram'>('primary');
  const [loaded, setLoaded] = useState(false);

  const { domain, primarySrc, fallbackSrc } = resolveFaviconUrl(url, size);

  const roundedClass =
    rounded === '2xl'
      ? 'rounded-2xl'
      : rounded === 'xl'
      ? 'rounded-xl'
      : rounded === 'lg'
      ? 'rounded-lg'
      : rounded === 'md'
      ? 'rounded-md'
      : 'rounded-full';

  if (stage === 'monogram' || !domain) {
    const fallbackBg = color === '#ffffff' ? '#18181b' : color + '22';
    const fallbackTextColor = color === '#ffffff' ? '#ffffff' : color;

    return (
      <span
        className={
          fallbackClassName ||
          `inline-flex items-center justify-center font-extrabold ${roundedClass}`
        }
        style={{
          width: size ? `${size}px` : '100%',
          height: size ? `${size}px` : '100%',
          backgroundColor: fallbackBg,
          color: fallbackTextColor,
        }}
      >
        {logo}
      </span>
    );
  }

  const faviconUrl = stage === 'primary' ? primarySrc : fallbackSrc;

  return (
    <Image
      src={faviconUrl}
      alt={`${logo} logo`}
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (stage === 'primary' && primarySrc !== fallbackSrc) {
          setStage('fallback');
        } else {
          setStage('monogram');
        }
      }}
      className={`object-contain transition-opacity duration-200 ${
        loaded ? 'opacity-100' : 'opacity-80'
      } ${className || `w-full h-full p-1 ${roundedClass} bg-white/10`}`}
      unoptimized
    />
  );
}
