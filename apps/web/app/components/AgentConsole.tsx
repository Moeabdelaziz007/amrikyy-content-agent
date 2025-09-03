'use client';

import React, { useState, useEffect } from 'react';
import { Play, Settings, Clock, Zap, AlertCircle, Copy, CheckCircle, BarChart3 } from 'lucide-react';

export default function AgentConsole() {
  const [prompt, setPrompt] = useState('Write a 5-tweet thread about why L2s matter.');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('short');
  const [asyncMode, setAsyncMode] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState({ remaining: 50, limit: 50, resetAt: Date.now() + 3600000 });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const runAgent = async () => {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          input: { prompt, tone, length },
          async: asyncMode
        })
      });
      const data = await r.json();
      if (!r.ok) {
        throw new Error(data?.error || 'Agent error');
      }
      setResult(data);
      
      // Update quota if available in response
      if (data.quota) {
        setQuota(data.quota);
      }
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-cyber-success text-cyber-bg px-6 py-3 rounded-lg shadow-cyber-sm z-50';
      successMsg.textContent = '✓ Agent executed successfully';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (e: any) {
      // Show error with cyber styling
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-cyber-error text-white px-6 py-3 rounded-lg shadow-cyber-sm z-50';
      errorMsg.textContent = `✗ ${e?.message || 'Agent execution failed'}`;
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-cyber space-y-6">
      {/* Quota Display */}
      <div className="p-4 bg-cyber-bg-tertiary border border-cyber-border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-cyber-accent" />
            <span className="text-sm font-medium text-cyber-text">Usage Quota</span>
          </div>
          <div className="text-sm text-cyber-text-secondary">
            {quota.remaining}/{quota.limit} requests
          </div>
        </div>
        
        <div className="w-full bg-cyber-bg rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyber-accent to-cyber-accent-secondary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((quota.limit - quota.remaining) / quota.limit) * 100}%` }}
          ></div>
        </div>
        
        <div className="text-xs text-cyber-text-muted mt-2">
          Resets in {Math.ceil((quota.resetAt - Date.now()) / 60000)} minutes
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-cyber-text">
          Content Prompt
        </label>
        <textarea
          className="input-cyber w-full resize-none"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what content you want the AI agent to generate..."
        />
        <div className="text-xs text-cyber-text-muted">
          {prompt.length}/1000 characters
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-cyber-accent" />
          <span className="text-sm font-medium text-cyber-text">Configuration</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs text-cyber-text-secondary">Tone</label>
            <select 
              className="input-cyber w-full" 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="crypto-native">Crypto-native</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs text-cyber-text-secondary">Length</label>
            <select 
              className="input-cyber w-full" 
              value={length} 
              onChange={(e) => setLength(e.target.value as any)}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>

        {/* Async Mode Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-cyber-bg-tertiary rounded-lg">
          <input 
            type="checkbox" 
            id="asyncMode"
            checked={asyncMode} 
            onChange={(e) => setAsyncMode(e.target.checked)}
            className="w-4 h-4 text-cyber-accent bg-cyber-bg border-cyber-border rounded focus:ring-cyber-accent focus:ring-2"
          />
          <label htmlFor="asyncMode" className="flex items-center space-x-2 text-sm text-cyber-text-secondary">
            <Clock className="w-4 h-4" />
            <span>Run as background job</span>
          </label>
        </div>
      </div>

      {/* Execute Button */}
      <button 
        onClick={runAgent} 
        disabled={loading || !prompt.trim()} 
        className="btn-cyber w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-cyber-bg border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Execute Agent</span>
          </>
        )}
      </button>

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyber-success" />
            <span className="text-sm font-medium text-cyber-text">Generated Content</span>
          </div>
          
          {/* Structured Content */}
          {result.result?.output?.thread && (
            <div className="space-y-3">
              {result.result.output.thread.map((item: string, index: number) => (
                <div key={index} className="p-4 bg-cyber-bg-tertiary border border-cyber-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-cyber-accent/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-cyber-accent">{index + 1}</span>
                        </div>
                        <span className="text-xs text-cyber-text-muted">Tweet {index + 1}</span>
                      </div>
                      <p className="text-cyber-text-secondary text-sm leading-relaxed">{item}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item, index)}
                      className="ml-3 p-2 text-cyber-text-muted hover:text-cyber-accent transition-colors"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="w-4 h-4 text-cyber-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Raw JSON (Collapsible) */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-cyber-text-muted hover:text-cyber-text transition-colors">
              View Raw JSON
            </summary>
            <pre className="mt-2 bg-cyber-bg-tertiary border border-cyber-border rounded-lg p-4 text-xs text-cyber-text-secondary overflow-auto max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
