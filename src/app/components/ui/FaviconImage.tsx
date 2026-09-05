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

/**
 * Displays a site's favicon fetched from Google's favicon API.
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
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const domain = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .trim();

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

  if (error || !domain) {
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

  const faviconUrl = `https://www.google.com/s2/favicons?sz=${size >= 96 ? '128' : '64'}&domain=${domain}`;

  return (
    <Image
      src={faviconUrl}
      alt={`${logo} logo`}
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={`object-contain transition-opacity duration-200 ${
        loaded ? 'opacity-100' : 'opacity-80'
      } ${className || `w-full h-full p-1 ${roundedClass} bg-white/10`}`}
      unoptimized
    />
  );
}
