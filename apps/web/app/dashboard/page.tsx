'use client';

import { useState } from 'react';
import { Cpu, Zap, Activity, Lightbulb, Tags, MessageSquare, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';

// Mock result for demonstration purposes
const mockResult = {
  title: "The Quantum Leap in Decentralized AI",
  strategy_brief: "Target emerging AI and crypto enthusiasts by framing decentralized AI as a paradigm shift in computing, using the quantum leap metaphor to signify a fundamental change.",
  seo_keywords: ["Decentralized AI", "Web3 AI", "Crypto AI", "Quantum Computing", "AI on Blockchain"],
  thread: [
    "1/ The next evolution of AI isn\'t just about better algorithms; it\'s about where they live. We\'re moving from centralized servers to a decentralized, user-owned ecosystem. This is the quantum leap.",
    "2/ Think of it like this: Today\'s AI is like classical physics—predictable but limited by its environment. Decentralized AI is like quantum mechanics—opening up a new universe of possibilities.",
  ],
  hashtags: ["#DecentralizedAI", "#AI", "#Web3", "#Crypto", "#QuantumComputing", "#Blockchain"],
  visual_concept: "A visually stunning image of a classic atom with electrons in orbit, transforming into a complex, glowing quantum wave function. The transition should be marked by a bright flash of neon green light.",
  image_url: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-xxxxxxxx/user-xxxxxxxx/img-xxxxxxxx.png?st=2023-01-01T00%3A00%3A00Z&se=2023-01-02T00%3A00%3A00Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&sktid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&sks=b&sig=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx%3D",
};

export default function ElectricAgentDashboard() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = () => {
    setIsLoading(true);
    setResult(null); // Clear previous results
    setTimeout(() => {
      setResult(mockResult);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background-abyss text-text-bright font-sans">
      {/* Header */}
      <header className="bg-surface-glass/50 backdrop-filter backdrop-blur-lg border-b border-border-glow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-accent-electric-jade animate-pulse-glow" />
            <h1 className="text-xl font-bold text-text-bright">Electric Soul Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-accent-electric-jade">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            System Online
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Column: Control Panel */}
          <div className="lg:col-span-2">
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-accent-electric-jade" />
                <h2 className="text-lg font-semibold">Agent Control</h2>
              </div>
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Unleash an idea..."
                  className="input-glass w-full h-36 resize-none text-base"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="btn-glow w-full flex items-center justify-center gap-2 text-lg">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  {isLoading ? 'Energizing...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Output Terminal */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading && (
              <div className="card-glass flex flex-col items-center justify-center p-12">
                <Loader2 className="w-12 h-12 text-accent-electric-jade animate-spin mb-4" />
                <p className="text-text-muted">Agent is creating...</p>
              </div>
            )}

            {!isLoading && !result && (
              <div className="card-glass flex flex-col items-center justify-center p-12 text-center">
                <Cpu className="w-12 h-12 text-border-glow mb-4" />
                <h3 className="font-semibold text-text-bright">Output Terminal</h3>
                <p className="text-sm text-text-muted">Generated content will appear here.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-stagger">
                {Object.entries(result).map(([key, value], index) => (
                  <div key={key} className="card-glass" style={{ '--stagger-index': index } as React.CSSProperties}>
                    <div className="flex items-center gap-3 text-sm text-accent-electric-jade mb-3">
                      {key === 'image_url' && <ImageIcon className="w-4 h-4" />}
                      {key === 'strategy_brief' && <Lightbulb className="w-4 h-4" />}
                      {key === 'seo_keywords' && <Tags className="w-4 h-4" />}
                      {key === 'thread' && <MessageSquare className="w-4 h-4" />}
                      {key === 'hashtags' && <Activity className="w-4 h-4" />}
                      <span className="font-semibold uppercase tracking-wider">{key.replace('_', ' ')}</span>
                    </div>
                    {key === 'image_url' && <img src={value as string} alt={result.visual_concept} className="w-full rounded-lg" />}
                    {key === 'strategy_brief' && <p className="text-sm text-text-bright">{value as string}</p>}
                    {key === 'seo_keywords' && <div className="flex flex-wrap gap-2">{(value as string[]).map(kw => <span key={kw} className="bg-surface-glass text-xs font-medium px-2 py-1 rounded-full border border-border-glow">{kw}</span>)}</div>}
                    {key === 'thread' && <div className="space-y-3">{(value as string[]).map((tweet, i) => <p key={i} className="text-sm text-text-bright bg-background-abyss/50 p-3 rounded-lg">{tweet}</p>)}</div>}
                    {key === 'hashtags' && <div className="flex flex-wrap gap-2">{(value as string[]).map(tag => <span key={tag} className="text-accent-cyber-pink text-xs font-medium">{tag}</span>)}</div>}
                    {key === 'title' && <h3 className="text-lg font-bold text-accent-electric-jade">{value as string}</h3>}
                    {key === 'visual_concept' && <p className="text-sm text-text-muted italic">{value as string}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
