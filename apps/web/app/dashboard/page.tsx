'use client';

import { useState } from 'react';
import { Cpu, Zap, Activity, Lightbulb, Tags, MessageSquare, Image as ImageIcon, Loader2, Sparkles, User, Shield, BrainCircuit, BarChart, PenLine, Smile, Code, Bot, Database } from 'lucide-react';

// --- Agent Type Definition ---
interface Agent {
  id: string;
  name: string;
  avatar: React.ElementType;
  persona: string;
  skills: string[];
  status: string;
  squad: 'content' | 'dev' | 'data'; // Added 'data' squad
}

// --- Agent Definitions ---
const agents: Agent[] = [
  // Content Squad
  { id: 'aura', name: 'Aura', avatar: Smile, persona: 'The Empath. An AI expert in sentiment analysis, Aura understands the emotional landscape of your content, ensuring every message resonates deeply with your audience.', skills: ['Sentiment Analysis', 'Emotional Tone Detection'], status: 'Online', squad: 'content' },
  { id: 'orion', name: 'Orion', avatar: BrainCircuit, persona: 'The Strategist. Orion navigates the vast data cosmos, identifying market trends and crafting precise SEO strategies to position your content for maximum impact.', skills: ['SEO Analysis', 'Trend Forecasting'], status: 'Online', squad: 'content' },
  { id: 'echo', name: 'Echo', avatar: MessageSquare, persona: 'The Copywriter. Echo transforms raw ideas into compelling narratives, weaving words that capture attention and drive engagement across all platforms.', skills: ['Viral Thread Crafting', 'Storytelling'], status: 'Online', squad: 'content' },
  { id: 'helios', name: 'Helios', avatar: PenLine, persona: 'The Editor. Helios illuminates your content, refining every phrase and crafting irresistible hooks that draw readers in and amplify your message\'s reach.', skills: ['Viral Hook Refinement', 'Engagement Maximization'], status: 'Online', squad: 'content' },
  { id: 'nova', name: 'Nova', avatar: ImageIcon, persona: 'The Visionary. Nova brings your concepts to life, generating stunning, high-fidelity visuals that perfectly complement your narrative and captivate your audience.', skills: ['Visual Concept Generation', 'DALL-E 3 Image Creation'], status: 'Online', squad: 'content' },
  { id: 'cygnus', name: 'Cygnus', avatar: BarChart, persona: 'The Amplifier. Cygnus optimizes your content for maximum visibility, deploying precision-targeted hashtags and insights to ensure your message soars across social networks.', skills: ['Hashtag Optimization', 'Reach Maximization'], status: 'Online', squad: 'content' },
  // Dev Squad
  { id: 'codex', name: 'Codex', avatar: Code, persona: 'The Architect. A world-class AI coding expert, Codex translates natural language into clean, efficient, and production-ready code across multiple languages.', skills: ['Code Generation', 'Bug Squashing', 'Algorithm Design', 'API Integration'], status: 'Online', squad: 'dev' },
  // Data Squad
  { id: 'sentinel', name: 'Sentinel', avatar: Database, persona: 'The Data Sentinel. Sentinel tirelessly collects, processes, and secures vast datasets, providing the raw intelligence needed for all agent operations.', skills: ['Data Acquisition', 'Data Cleaning', 'Secure Storage', 'Real-time Feeds'], status: 'Online', squad: 'data' },
];

const mockContentApiResponse = {
  title: "The Quantum Leap in Decentralized AI",
  sentiment: "Excited",
  strategy_brief: "Target emerging AI and crypto enthusiasts by framing decentralized AI as a paradigm shift in computing, using the quantum leap metaphor to signify a fundamental change.",
  seo_keywords: ["Decentralized AI", "Web3 AI", "Crypto AI", "Quantum Computing", "AI on Blockchain"],
  thread: [
    "🚀 THIS is the quantum leap for AI. We\'re not just improving algorithms; we\'re changing their universe.",
    "2/ Think of it like this: Today\'s AI is like classical physics—predictable but limited by its environment. Decentralized AI is like quantum mechanics—opening up a new universe of possibilities.",
  ],
  hashtags: ["#DecentralizedAI", "#AI", "#Web3", "#Crypto", "#QuantumComputing", "#Blockchain"],
  visual_concept: "A visually stunning image of a classic atom with electrons in orbit, transforming into a complex, glowing quantum wave function. The transition should be marked by a bright flash of neon green light.",
  image_url: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-xxxxxxxx/user-xxxxxxxx/img-xxxxxxxx.png?st=2023-01-01T00%3A00%3A00Z&se=2023-01-02T00%3A00%3A00Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&sktid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&sks=b&sig=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx%3D",
};
const mockCodeApiResponse = { language: "python", code: "def hello_world():\n    print(\"Hello, Amrikyy AI Solutions!\")" };
const mockDataApiResponse = { report: "Data collection successful. 1.2TB of relevant crypto market data acquired and cleaned.", summary: "Key trends indicate increasing institutional interest in DeFi protocols." };

export default function AgentOSDashboard() {
  const [taskType, setTaskType] = useState<'content' | 'dev' | 'data'>('content'); // Updated taskType
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(agents.find(a => a.squad === taskType));
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const currentSquad = agents.filter(a => a.squad === taskType);

  const handleTaskChange = (type: 'content' | 'dev' | 'data') => {
    setTaskType(type);
    setSelectedAgent(agents.find(a => a.squad === type));
    setResult(null);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);
    setTimeout(() => {
      if (taskType === 'content') {
        setResult(mockContentApiResponse);
      } else if (taskType === 'dev') {
        setResult(mockCodeApiResponse);
      } else if (taskType === 'data') {
        setResult(mockDataApiResponse);
      }
      setIsLoading(false);
    }, 2000);
  };

  if (!selectedAgent) {
    return (
      <div className="min-h-screen bg-background-abyss flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-electric-jade animate-spin" />
        <p className="ml-4 text-text-muted">Initializing Agent OS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-abyss text-text-bright font-sans">
      <header className="bg-surface-glass/50 backdrop-filter backdrop-blur-lg border-b border-border-glow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent-electric-jade" />
            <h1 className="text-xl font-bold">Amrikyy AI Solutions</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-accent-electric-jade">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            All Systems Nominal
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Task Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-surface-glass p-1 rounded-lg border border-border-glow flex gap-2">
            <button onClick={() => handleTaskChange('content')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${taskType === 'content' ? 'bg-accent-electric-jade text-background-abyss' : 'text-text-muted'}`}>Content Squad</button>
            <button onClick={() => handleTaskChange('dev')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${taskType === 'dev' ? 'bg-accent-electric-jade text-background-abyss' : 'text-text-muted'}`}>Dev Squad</button>
            <button onClick={() => handleTaskChange('data')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${taskType === 'data' ? 'bg-accent-electric-jade text-background-abyss' : 'text-text-muted'}`}>Data Squad</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-semibold text-text-muted tracking-wider">{taskType.toUpperCase()} SQUAD ROSTER</h2>
            <div className="space-y-3">
              {currentSquad.map(agent => (
                <div key={agent.id} onClick={() => setSelectedAgent(agent)} className={`card-glass p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 ${selectedAgent.id === agent.id ? 'border-accent-electric-jade' : ''}`}>
                  <div className="agent-avatar-badge">
                    <agent.avatar className={`w-8 h-8 transition-colors ${selectedAgent.id === agent.id ? 'text-accent-electric-jade animate-pulse-glow' : 'text-text-muted'}`} />
                  </div>
                  <div><h3 className="font-bold text-lg">{agent.name}</h3><p className={`text-xs transition-colors ${selectedAgent.id === agent.id ? 'text-accent-electric-jade' : 'text-text-muted'}`}>{agent.status}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="card-glass p-6">
              <div className="flex items-center gap-6">
                <div className="agent-avatar-badge-lg">
                  <selectedAgent.avatar className="w-20 h-20 text-accent-electric-jade" />
                </div>
                <div><h2 className="text-4xl font-bold">{selectedAgent.name}</h2><p className="text-lg text-accent-cyber-pink">{selectedAgent.persona}</p></div>
              </div>
              <div className="mt-6"><h4 className="font-semibold text-text-muted mb-3">Core Skills:</h4><div className="flex flex-wrap gap-2">{selectedAgent.skills.map(skill => <span key={skill} className="bg-surface-glass text-xs font-medium px-3 py-1 rounded-full border border-border-glow skill-tag">{skill}</span>)}</div></div>
            </div>

            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold mb-4">Delegate Task to {taskType === 'content' ? 'the Content Squad' : taskType === 'dev' ? 'Codex' : 'Sentinel'}</h3>
              <div className="space-y-4">
                <textarea placeholder={taskType === 'content' ? 'Brief the content team...' : taskType === 'dev' ? 'Describe the coding task...' : 'Specify data collection parameters...'} className="input-glass w-full h-28 resize-none text-base" onChange={(e) => setPrompt(e.target.value)} />
                <button onClick={handleGenerate} disabled={isLoading} className="btn-glow w-full flex items-center justify-center gap-2 text-lg">
                  {isLoading ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /><span>Executing...</span></>
                  ) : (
                    <><Zap className="w-6 h-6" /><span>Engage Agents</span></>
                  )}
                </button>
              </div>
            )}

            {isLoading && <div className="card-glass flex items-center justify-center p-12"><Loader2 className="w-12 h-12 text-accent-electric-jade animate-spin" /><p className="ml-4 text-text-muted">Agents are collaborating...</p></div>}
            
            {result && taskType === 'content' && (
              <div className="space-y-4 animate-stagger">
                {result.title && <div className="card-glass" style={{ '--stagger-index': 1 } as React.CSSProperties}>
                  <h3 className="text-xl font-bold text-accent-electric-jade mb-3">{result.title}</h3>
                  {result.image_url && <img src={result.image_url} alt={result.visual_concept || 'Generated Image'} className="w-full rounded-lg" />}
                  {result.visual_concept && <p className="text-sm text-text-muted italic mt-2">Visual Concept: {result.visual_concept}</p>}
                </div>}

                {result.sentiment && <div className="card-glass" style={{ '--stagger-index': 2 } as React.CSSProperties}>
                  <div className="flex items-center gap-3 text-sm text-accent-electric-jade mb-3"><Smile className="w-4 h-4" /><span className="font-semibold uppercase tracking-wider">Sentiment Analysis</span></div>
                  <p className="text-2xl font-bold text-accent-cyber-pink">{result.sentiment}</p>
                </div>}

                {result.strategy_brief && <div className="card-glass" style={{ '--stagger-index': 3 } as React.CSSProperties}>
                  <div className="flex items-center gap-3 text-sm text-accent-electric-jade mb-3"><Lightbulb className="w-4 h-4" /><span className="font-semibold uppercase tracking-wider">Strategy Brief</span></div>
                  <p className="text-sm">{result.strategy_brief}</p>
                </div>}

                {result.thread && <div className="card-glass" style={{ '--stagger-index': 4 } as React.CSSProperties}>
                  <div className="flex items-center gap-3 text-sm text-accent-electric-jade mb-3"><MessageSquare className="w-4 h-4" /><span className="font-semibold uppercase tracking-wider">Generated Thread</span></div>
                  <div className="space-y-3">
                    {result.thread.map((tweet: string, i: number) => <p key={i} className="text-sm bg-background-abyss/50 p-3 rounded-lg">{tweet}</p>)}                  
                  </div>
                </div>}

                <div className="grid grid-cols-2 gap-4">
                  {result.seo_keywords && <div className="card-glass" style={{ '--stagger-index': 5 } as React.CSSProperties}>
                    <div className="flex items-center gap-3 text-sm text-accent-electric-jade mb-3"><Tags className="w-4 h-4" /><span className="font-semibold uppercase tracking-wider">SEO Keywords</span></div>
                    <div className="flex flex-wrap gap-2">
                      {result.seo_keywords.map((kw: string) => <span key={kw} className="bg-surface-glass text-xs font-medium px-2 py-1 rounded-full border border-border-glow skill-tag">{kw}</span>)}
                    </div>
                  </div>}
                  {result.hashtags && <div className="card-glass" style={{ '--stagger-index': 6 } as React.CSSProperties}>
                    <div className="flex items-center gap-3 text-sm text-accent-electric-jade mb-3"><Activity className="w-4 h-4" /><span className="font-semibold uppercase tracking-wider">Hashtags</span></div>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((tag: string) => <span key={tag} className="text-accent-cyber-pink text-xs font-medium">{tag}</span>)}
                    </div>
                  </div>}
                </div>
              </div>
            )}

            {result && taskType === 'dev' && (
              <div className="card-glass p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 text-sm text-accent-electric-jade mb-3"><Code className="w-4 h-4" /><span className="font-semibold uppercase tracking-wider">Generated Code ({result.language})</span></div>
                <div className="bg-background-abyss/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">{result.code}</div>
              </div>
            )}

            {result && taskType === 'data' && (
              <div className="card-glass p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 text-sm text-accent-electric-jade mb-3"><Database className="w-4 h-4" /><span className="font-semibold uppercase tracking-wider">Data Collection Report</span></div>
                <p className="text-sm text-text-bright">Data collection for your prompt is complete. Sentinel has acquired and processed the necessary information.</p>
                {/* You would display actual data results here */}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
