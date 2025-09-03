// No React import needed in Next.js 13+ App Router
import Link from 'next/link';
import WalletConnect from './components/WalletConnect';
import { Zap, Shield, Cpu, ArrowRight } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-cyber-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4">
              AI + Crypto
              <span className="block text-cyber-accent">Autonomous Agents</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyber-accent to-cyber-accent-secondary mx-auto rounded-full"></div>
          </div>
          
          {/* Subtitle */}
          <p className="text-xl text-cyber-text-secondary mb-16 max-w-3xl mx-auto leading-relaxed">
            Deploy intelligent agents that work 24/7, integrated with crypto payments and Web3 authentication. 
            Built for developers who demand control and efficiency.
          </p>

          {/* Features Grid */}
          <div className="grid-cyber grid-cyber-3 mb-16">
            <div className="card-cyber text-center group">
              <div className="w-16 h-16 bg-cyber-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyber-accent/30 transition-colors">
                <Cpu className="w-8 h-8 text-cyber-accent" />
              </div>
              <h3 className="text-xl font-semibold text-cyber-text mb-2">AI Agents</h3>
              <p className="text-cyber-text-secondary">Content generation, trading, and analysis agents running autonomously</p>
            </div>
            
            <div className="card-cyber text-center group">
              <div className="w-16 h-16 bg-cyber-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyber-accent/30 transition-colors">
                <Shield className="w-8 h-8 text-cyber-accent" />
              </div>
              <h3 className="text-xl font-semibold text-cyber-text mb-2">Web3 Security</h3>
              <p className="text-cyber-text-secondary">SIWE authentication and crypto-native payment integration</p>
            </div>
            
            <div className="card-cyber text-center group">
              <div className="w-16 h-16 bg-cyber-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cyber-accent/30 transition-colors">
                <Zap className="w-8 h-8 text-cyber-accent" />
              </div>
              <h3 className="text-xl font-semibold text-cyber-text mb-2">Lightning Fast</h3>
              <p className="text-cyber-text-secondary">Optimized for speed and efficiency with real-time processing</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-8">
            <WalletConnect />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-cyber-text mb-2">Ready to Deploy?</h3>
                <p className="text-cyber-text-secondary text-sm max-w-md">
                  Connect your wallet and start generating content with AI agents in seconds
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Link
                  href="/dashboard"
                  className="btn-cyber flex items-center space-x-2 group"
                >
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button className="px-6 py-3 border border-cyber-border text-cyber-text-secondary hover:text-cyber-text hover:border-cyber-accent rounded-lg transition-colors">
                  View Docs
                </button>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-16 flex items-center justify-center space-x-2 text-cyber-text-secondary">
            <div className="w-2 h-2 bg-cyber-success rounded-full animate-cyber-pulse"></div>
            <span className="text-sm">System Online • Ready for Deployment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Run: npm run dev */
