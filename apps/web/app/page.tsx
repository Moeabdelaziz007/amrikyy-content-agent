import Link from 'next/link';
import WalletConnect from './components/WalletConnect';
import { Zap, Shield, Cpu, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-abyss text-text-bright">
      {/* Header */}
      <header className="bg-surface-glass/50 backdrop-filter backdrop-blur-lg border-b border-border-glow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-accent-electric-jade" />
            <h1 className="text-xl font-bold">Amrikyy AI Solutions</h1>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
          The Dawn of the
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-jade to-accent-cyber-pink"> Agentic Era</span>
        </h1>
        <p className="text-lg text-text-muted max-w-3xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Deploy autonomous AI agents that create, optimize, and amplify your content. Welcome to the future of digital strategy.
        </p>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link href="/dashboard" className="btn-glow inline-flex items-center gap-2 text-lg">
            Launch Agent OS <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-stagger">
          <div className="card-glass p-8 text-center" style={{ '--stagger-index': 1 } as React.CSSProperties}>
            <div className="w-16 h-16 bg-surface-glass border border-border-glow rounded-full flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-8 h-8 text-accent-electric-jade" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Autonomous Agents</h3>
            <p className="text-text-muted">A team of specialized AIs working in concert to execute complex content strategies.</p>
          </div>
          <div className="card-glass p-8 text-center" style={{ '--stagger-index': 2 } as React.CSSProperties}>
            <div className="w-16 h-16 bg-surface-glass border border-border-glow rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-accent-electric-jade" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Web3 Native</h3>
            <p className="text-text-muted">Securely connect with SIWE. The entire system is built for the decentralized future.</p>
          </div>
          <div className="card-glass p-8 text-center" style={{ '--stagger-index': 3 } as React.CSSProperties}>
            <div className="w-16 h-16 bg-surface-glass border border-border-glow rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-accent-electric-jade" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dynamic & Fast</h3>
            <p className="text-text-muted">A highly responsive and animated interface designed for a seamless user experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
