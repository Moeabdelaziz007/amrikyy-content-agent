import type { NextPage } from 'next';
import Head from 'next/head';
import { Shield } from 'lucide-react';

const AlphaDeniedPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-background-abyss text-text-bright flex flex-col items-center justify-center p-6">
      <Head>
        <title>Alpha Access Required</title>
      </Head>

      <div className="card-glass p-10 text-center max-w-lg">
        <div className="w-20 h-20 bg-surface-glass border border-border-glow rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-accent-cyber-pink" />
        </div>
        <h1 className="text-3xl font-bold text-accent-electric-jade mb-4">Alpha Access Required</h1>
        <p className="text-text-muted">
          This platform is currently in a private alpha test phase. Access is restricted to whitelisted wallet addresses only.
        </p>
        <p className="text-text-muted mt-2">
          We appreciate your interest in the future of agentic technology.
        </p>
      </div>
    </div>
  );
};

export default AlphaDeniedPage;
