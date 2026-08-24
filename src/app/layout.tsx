import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Footer from "./components/Footer";
import { CURRENT_YEAR } from "../lib/currentYear";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pulstraffic.com"),
  title: `Pulse - Global Web Traffic Rankings & Index (${CURRENT_YEAR})`,
  description: "The transparent, model-driven index of global web traffic. Track estimated visitor rates, monthly visits, and rankings for 100+ top websites worldwide, powered by the Pulse Traffic Index (PTI).",
  applicationName: "Pulse",
  authors: [{ name: "Pulse", url: "https://www.pulstraffic.com" }],
  creator: "Pulse",
  publisher: "Pulse",
  category: "Technology & Internet Analytics",
  keywords: [
    "website traffic",
    "web traffic visualizer",
    "real-time website visits",
    `most visited websites ${CURRENT_YEAR}`,
    "top websites by country",
    "website traffic comparison",
    "internet speed test",
    "global internet statistics",
    "pulse traffic index",
    "cloudflare radar traffic",
  ],
  alternates: {
    canonical: "https://www.pulstraffic.com",
  },
  openGraph: {
    title: `Pulse - Global Web Traffic Rankings & Index (${CURRENT_YEAR})`,
    description: "The transparent, model-driven index of global web traffic. Track estimated visitor rates and monthly visits for 100+ top websites worldwide.",
    url: "https://www.pulstraffic.com",
    siteName: "Pulse",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Pulse - Live Global Web Traffic Visualizer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Pulse - Global Web Traffic Rankings & Index (${CURRENT_YEAR})`,
    description: "A real-time ticker visualizing estimated visitors across the world's most popular websites.",
    images: ["/opengraph-image"],
    creator: "@pulstraffic",
    site: "@pulstraffic",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Pulse',
    'url': 'https://www.pulstraffic.com',
    'description': 'A real-time ticker visualizing estimated visitors across the world\'s most popular websites.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://www.pulstraffic.com/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Pulse',
    'url': 'https://www.pulstraffic.com',
    'logo': 'https://www.pulstraffic.com/favicon.png'
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PL277Z4KW6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PL277Z4KW6');
          `}
        </Script>
        <Script async src="https://omni-route-rho.vercel.app/api/v1/track.js?site=www.pulstraffic.com"></Script>
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
