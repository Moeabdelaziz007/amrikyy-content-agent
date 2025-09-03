import './globals.css';
import React from 'react';
import { headers } from 'next/headers';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, sepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define chains with proper typing
const chains = [mainnet, polygon, sepolia] as const;

const wagmiConfig = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  }
});

const queryClient = new QueryClient();

export const metadata = {
  title: 'AI + Crypto Autonomous Agents Hub',
  description: 'Deploy intelligent agents that work 24/7, integrated with crypto payments and Web3 authentication',
  keywords: 'AI, Crypto, Web3, Autonomous Agents, Content Generation, Trading Bots',
  authors: [{ name: 'Amrikyy' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00D4FF',
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
      <body className="min-h-screen bg-cyber-bg text-cyber-text antialiased">
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}

/* How to run locally:
   - npm i && npm run dev
   - Requires env: NEXT_PUBLIC_DEV_MODE, FUNCTIONS_BASE_URL, SENTRY_DSN_FRONTEND (optional)
*/
