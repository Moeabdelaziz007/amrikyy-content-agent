'use client';

import { useState } from 'react';
import { Cpu, Zap, Activity, Lightbulb, Tags, MessageSquare, Image as ImageIcon, Loader2, Sparkles, User, Shield, BrainCircuit, BarChart } from 'lucide-react';

// --- Agent Definitions ---
const agents = [
  {
    id: 'orion',
    name: 'Orion',
    avatar: BrainCircuit,
    persona: 'The Strategist',
    skills: ['SEO Analysis', 'Trend Forecasting', 'Strategy Briefs'],
    status: 'Online',
  },
  {
    id: 'echo',
    name: 'Echo',
    avatar: MessageSquare,
    persona: 'The Copywriter',
    skills: ['Viral Thread Crafting', 'Tone Adaptation', 'Storytelling'],
    status: 'Online',
  },
  {
    id: 'nova',
    name: 'Nova',
    avatar: ImageIcon,
    persona: 'The Visionary',
    skills: ['Visual Concept Generation', 'DALL-E 3 Image Creation'],
    status: 'Online',
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    avatar: BarChart,
    persona: 'The Amplifier',
    skills: ['Hashtag Optimization', 'Reach Maximization'],
    status: 'Online',
  },
];

export default function AgentOSDashboard() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background-abyss text-text-bright font-sans">
      {/* Header */}
      <header className="bg-surface-glass/50 backdrop-filter backdrop-blur-lg border-b border-border-glow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent-electric-jade" />
            <h1 className="text-xl font-bold text-text-bright">Agent Operating System</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-accent-electric-jade">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            All Systems Nominal
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Agent Roster */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-semibold text-text-muted tracking-wider">AGENT ROSTER</h2>
            <div className="space-y-3">
              {agents.map(agent => (
                <div 
                  key={agent.id} 
                  onClick={() => setSelectedAgent(agent)}
                  className={`card-glass p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 ${selectedAgent.id === agent.id ? 'border-accent-electric-jade' : ''}`}>
                  <agent.avatar className={`w-8 h-8 ${selectedAgent.id === agent.id ? 'text-accent-electric-jade' : 'text-text-muted'}`} />
                  <div>
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                    <p className={`text-xs ${selectedAgent.id === agent.id ? 'text-accent-electric-jade' : 'text-text-muted'}`}>{agent.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Agent Profile & Task Manager */}
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Profile Card */}
            <div className="card-glass p-6">
              <div className="flex items-center gap-6">
                <selectedAgent.avatar className="w-20 h-20 text-accent-electric-jade" />
                <div>
                  <h2 className="text-4xl font-bold">{selectedAgent.name}</h2>
                  <p className="text-lg text-accent-cyber-pink">{selectedAgent.persona}</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-text-muted mb-3">Core Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.skills.map(skill => (
                    <span key={skill} className="bg-surface-glass text-xs font-medium px-3 py-1 rounded-full border border-border-glow">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Delegation Card */}
            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold mb-4">Delegate Task to the Team</h3>
              <div className="space-y-4">
                <textarea
                  placeholder={`Brief ${selectedAgent.name} on the objective...`}
                  className="input-glass w-full h-28 resize-none text-base"
                />
                <button disabled={isLoading} className="btn-glow w-full flex items-center justify-center gap-2 text-lg">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                  {isLoading ? 'Executing...' : 'Engage Agents'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
