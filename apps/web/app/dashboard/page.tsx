'use client';

import { useState } from 'react';
import { Cpu, Zap, Activity, TrendingUp, Copy, History, Clock, Lightbulb, Tags, MessageSquare, Image as ImageIcon, Loader2 } from 'lucide-react';

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

export default function SmartAgentDashboard() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResult(mockResult);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-primary font-sans">
      {/* Header */}
      <header className="border-b border-border-subtle">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-surface-raised rounded-lg flex items-center justify-center border border-border-subtle">
              <Cpu className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Smart Agent Dashboard</h1>
              <p className="text-sm text-text-secondary">Viral Content & Media Engineer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
            System Online
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Column: Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-default p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-semibold">Control Panel</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-text-secondary mb-2">Your Prompt</label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., The future of decentralized AI"
                    className="input-default w-full h-32 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Tone of Voice</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Professional', 'Casual', 'Bold', 'Witty'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTone(t.toLowerCase())}
                        className={`btn-secondary text-sm py-2 ${tone === t.toLowerCase() ? 'bg-surface-raised border-accent-primary text-accent-primary' : ''}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  {isLoading ? 'Generating...' : 'Generate Content'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Output Terminal */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-accent-primary" />
              <h2 className="text-lg font-semibold">Output Terminal</h2>
            </div>

            {isLoading && (
              <div className="card-default flex flex-col items-center justify-center p-12">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin mb-4" />
                <p className="text-text-secondary">Agent is thinking...</p>
              </div>
            )}

            {!isLoading && !result && (
              <div className="card-default flex flex-col items-center justify-center p-12 text-center">
                <Cpu className="w-12 h-12 text-border-interactive mb-4" />
                <h3 className="font-semibold text-text-primary">Awaiting Task</h3>
                <p className="text-sm text-text-secondary">Your generated content will appear here.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Image Card */}
                <div className="card-default">
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                    <ImageIcon className="w-4 h-4" />
                    <span>Generated Image</span>
                  </div>
                  <img src={result.image_url} alt={result.visual_concept} className="w-full rounded-lg" />
                </div>

                {/* Strategy Card */}
                <div className="card-default">
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Strategy Brief</span>
                  </div>
                  <p className="text-sm text-text-primary">{result.strategy_brief}</p>
                </div>

                {/* Keywords Card */}
                <div className="card-default">
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <Tags className="w-4 h-4" />
                    <span>SEO Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.seo_keywords.map((kw: string) => <span key={kw} className="bg-surface-overlay text-xs font-medium px-2 py-1 rounded">{kw}</span>)}
                  </div>
                </div>

                {/* Thread Card */}
                <div className="card-default">
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                    <MessageSquare className="w-4 h-4" />
                    <span>Generated Thread</span>
                  </div>
                  <div className="space-y-3">
                    {result.thread.map((tweet: string, i: number) => <p key={i} className="text-sm text-text-primary bg-surface-overlay p-3 rounded-lg">{tweet}</p>)}
                  </div>
                </div>

                {/* Hashtags Card */}
                <div className="card-default">
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <History className="w-4 h-4" />
                    <span>Hashtags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag: string) => <span key={tag} className="text-accent-secondary text-xs font-medium">{tag}</span>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
