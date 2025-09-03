/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE || 'false',
    NEXT_PUBLIC_CHAINS: process.env.NEXT_PUBLIC_CHAINS || 'mainnet,polygon,arbitrum,sepolia',
    FUNCTIONS_BASE_URL: process.env.FUNCTIONS_BASE_URL || 'http://localhost:5001/PROJECT_ID/us-central1/contentAgent',
    SENTRY_DSN_FRONTEND: process.env.SENTRY_DSN_FRONTEND || ''
  }
};

module.exports = nextConfig;
