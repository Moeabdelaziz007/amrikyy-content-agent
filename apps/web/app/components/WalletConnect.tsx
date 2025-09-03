'use client';

import { useCallback, useState } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { Wallet, Shield, Zap, LogOut } from 'lucide-react';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  const signInWithEthereum = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    try {
      const domain = window.location.host;
      const origin = window.location.origin;
      const nonce = crypto.getRandomValues(new Uint8Array(8)).join('');

      const message = new SiweMessage({
        domain,
        address,
        statement: 'Sign in with Ethereum to access the AI + Crypto Autonomous Agents Hub.',
        uri: origin,
        version: '1',
        chainId: 1,
        nonce
      }).prepareMessage();

      const signature = await signMessageAsync({ message });

      const res = await fetch('/api/siwe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, signature })
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || 'SIWE failed');
      }
      
      // Show success with cyber styling
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-cyber-success text-cyber-bg px-6 py-3 rounded-lg shadow-cyber-sm z-50';
      successMsg.textContent = '✓ Authentication Successful';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (e: any) {
      console.error(e);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-cyber-error text-white px-6 py-3 rounded-lg shadow-cyber-sm z-50';
      errorMsg.textContent = `✗ ${e?.message || 'Authentication failed'}`;
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
    } finally {
      setLoading(false);
    }
  }, [address, signMessageAsync]);

  const devLogin = async () => {
    if (process.env.NEXT_PUBLIC_DEV_MODE !== 'true') return;
    const jwt = btoa(JSON.stringify({ sub: '0xdev', wallet: '0xdev' }));
    document.cookie = `siwe_jwt=${jwt}; path=/; SameSite=Lax`;
    
    const devMsg = document.createElement('div');
    devMsg.className = 'fixed top-4 right-4 bg-cyber-warning text-cyber-bg px-6 py-3 rounded-lg shadow-cyber-sm z-50';
    devMsg.textContent = '⚡ Dev Mode: Authentication Set';
    document.body.appendChild(devMsg);
    setTimeout(() => devMsg.remove(), 3000);
  };

  if (!isConnected) {
    return (
      <div className="card-cyber max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-cyber-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Wallet className="w-8 h-8 text-cyber-accent" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-cyber-text mb-2">Connect Your Wallet</h3>
            <p className="text-cyber-text-secondary text-sm">
              Use your wallet extension to connect and authenticate with Web3
            </p>
          </div>
          
          {process.env.NEXT_PUBLIC_DEV_MODE === 'true' && (
            <button 
              onClick={devLogin} 
              className="btn-cyber bg-cyber-warning text-cyber-bg hover:bg-cyber-warning/90"
            >
              <Zap className="w-4 h-4 mr-2" />
              Dev Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-cyber max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyber-success/20 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyber-success" />
          </div>
          <div>
            <p className="text-sm text-cyber-text-secondary">Connected</p>
            <p className="text-cyber-text font-mono text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={signInWithEthereum}
            disabled={loading}
            className="btn-cyber flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-cyber-bg border-t-transparent rounded-full animate-spin"></div>
                <span>Signing...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Authenticate</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => disconnect()} 
            className="px-4 py-2 border border-cyber-border text-cyber-text-secondary hover:text-cyber-text hover:border-cyber-accent rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* Usage:
   - Connect wallet in your browser, then click "Sign-In With Ethereum" to mint JWT.
*/
