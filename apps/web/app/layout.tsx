import './globals.css';
import { headers } from 'next/headers';
import Providers from './providers';

export const metadata = {
  title: 'AI + Crypto Autonomous Agents Hub',
  description: 'Deploy intelligent agents that work 24/7, integrated with crypto payments and Web3 authentication',
  keywords: 'AI, Crypto, Web3, Autonomous Agents, Content Generation, Trading Bots',
  authors: [{ name: 'Amrikyy' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00FFAA', // Updated to Electric Jade
  openGraph: {
    title: 'AI + Crypto Autonomous Agents Hub',
    description: 'Deploy intelligent agents that work 24/7, integrated with crypto payments and Web3 authentication',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI + Crypto Autonomous Agents Hub',
    description: 'Deploy intelligent agents that work 24/7, integrated with crypto payments and Web3 authentication',
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
