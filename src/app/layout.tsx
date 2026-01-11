import '@/styles/globals.css';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import { Navbar } from '@/components/navbar/navbar';
import { Provider } from '@/components/provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { siteConfig } from '@/lib/constant';
import { fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={cn('h-screen font-sans', fonts)}>
        <ThemeProvider attribute="class">
          <Provider>
            <TooltipProvider>
              <div className="flex h-full flex-col">
                <Navbar />
                <main className="flex-1 overflow-x-hidden">{children}</main>
              </div>
              <Toaster />
            </TooltipProvider>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
