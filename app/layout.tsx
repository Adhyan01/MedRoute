import type { Metadata } from 'next';
import './globals.css';
import { AccessibilityProvider } from '@/lib/accessibilityContext';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'MEDROUTE — The right hospital. Right now.',
  description: 'Connecting emergencies to hospitals with the right care, resources and verified capacity — in real time.',
  keywords: 'hospital finder, emergency care, ICU availability, real-time hospital capacity, medical emergency',
  openGraph: {
    title: 'MEDROUTE — The right hospital. Right now.',
    description: 'Real-time emergency hospital matching and capacity coordination.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0B0F19" />
      </head>
      <body className="min-h-screen bg-[#0B0F19] text-white dark" data-theme="dark">
        <AccessibilityProvider>
          <Header />
          <main className="pb-20 md:pb-0">
            {children}
          </main>
          <MobileNav />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
