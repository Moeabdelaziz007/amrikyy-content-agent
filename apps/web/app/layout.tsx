import './globals.css';
import { headers } from 'next/headers';
import Providers from './providers';

export const metadata = {
  title: 'Amrikyy AI Solutions',
  description: 'Deploy autonomous AI agent systems for content creation, marketing, and analysis.',
  keywords: 'Amrikyy, AI Solutions, AI Agents, Autonomous Agents, Content Generation',
  authors: [{ name: 'Amrikyy' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00FFAA',
  openGraph: {
    title: 'Amrikyy AI Solutions',
    description: 'Deploy autonomous AI agent systems for content creation, marketing, and analysis.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amrikyy AI Solutions',
    description: 'Deploy autonomous AI agent systems for content creation, marketing, and analysis.',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  headers();
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
