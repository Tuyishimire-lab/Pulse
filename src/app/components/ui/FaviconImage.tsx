'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface FaviconImageProps {
  url: string;
  logo: string;
  color: string;
}

/**
 * Displays a site's favicon fetched from Google's favicon API.
 * Falls back to a styled initial letter if the image fails to load.
 */
export default function FaviconImage({ url, logo, color }: FaviconImageProps) {
  const [error, setError] = useState(false);
  const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

  if (error) {
    return (
      <span
        style={{
          color: color === '#ffffff' ? '#111111' : '#ffffff',
          fontWeight: 800,
        }}
      >
        {logo}
      </span>
    );
  }

  return (
    <Image
      src={faviconUrl}
      alt={`${logo} logo`}
      width={64}
      height={64}
      onError={() => setError(true)}
      className="w-full h-full object-contain p-1 rounded-full bg-white/10"
      unoptimized
    />
  );
}
