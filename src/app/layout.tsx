import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Pulse - Live Global Web Traffic Visualizer",
  description: "A real-time ticker visualizing estimated visitors across the world's most popular websites.",
  metadataBase: new URL("https://pulstraffic.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pulse - Live Global Web Traffic Visualizer",
    description: "A real-time ticker visualizing estimated visitors across the world's most popular websites.",
    url: "https://pulstraffic.com",
    siteName: "Pulse",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Pulse Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse - Live Global Web Traffic Visualizer",
    description: "A real-time ticker visualizing estimated visitors across the world's most popular websites.",
    images: ["/favicon.png"],
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
    'url': 'https://pulstraffic.com',
    'description': 'A real-time ticker visualizing estimated visitors across the world\'s most popular websites.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://pulstraffic.com/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Pulse',
    'url': 'https://pulstraffic.com',
    'logo': 'https://pulstraffic.com/favicon.png'
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
        {children}
      </body>
    </html>
  );
}
