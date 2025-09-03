import React, { useState } from 'react';
import AgentConsole from '../components/AgentConsole';
import AgentResultCard from '../components/AgentResultCard';
import { Cpu, Activity, Zap, Clock, TrendingUp, Copy, History } from 'lucide-react';

export default function DashboardPage() {
  const [selectedAgent, setSelectedAgent] = useState('content');
  const [taskHistory, setTaskHistory] = useState<any[]>([]);

  const agents = [
    {
      id: 'content',
      name: 'Content Agent',
      description: 'Generate marketing content, tweets, and articles',
      icon: Copy,
      cost: 'Free',
      status: 'active',
      usage: '12/50 requests'
    },
    {
      id: 'trading',
      name: 'Trading Agent',
      description: 'Automated crypto trading with risk management',
      icon: TrendingUp,
      cost: 'Coming Soon',
      status: 'development',
      usage: '0/0 requests'
    },
    {
      id: 'analysis',
      name: 'Analysis Agent',
      description: 'Market sentiment and trend analysis',
      icon: Activity,
      cost: 'Coming Soon',
      status: 'development',
      usage: '0/0 requests'
    }
  ];

  return (
    <div className="min-h-screen bg-cyber-bg">
      {/* Header */}
      <div className="border-b border-cyber-border bg-cyber-bg-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyber-accent/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-cyber-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cyber-text">Agent Dashboard</h1>
                <p className="text-cyber-text-secondary">AI + Crypto Autonomous Agents Hub</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-cyber-text-secondary">
                <Activity className="w-4 h-4" />
                <span className="text-sm">System Online</span>
              </div>
              <div className="w-2 h-2 bg-cyber-success rounded-full animate-cyber-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid-cyber grid-cyber-3 gap-8">
          {/* Available Agents */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Cpu className="w-5 h-5 text-cyber-accent" />
              <h2 className="text-xl font-semibold text-cyber-text">Available Agents</h2>
            </div>
            
            <div className="space-y-4">
              {agents.map((agent) => {
                const IconComponent = agent.icon;
                const isSelected = selectedAgent === agent.id;
                const isActive = agent.status === 'active';
                
                return (
                  <div
                    key={agent.id}
                    onClick={() => isActive && setSelectedAgent(agent.id)}
                    className={`card-cyber cursor-pointer transition-all duration-200 ${
                      isSelected ? 'cyber-border' : ''
                    } ${!isActive ? 'opacity-60 cursor-not-allowed' : 'hover:border-cyber-accent'}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-cyber-accent/20' : 'bg-cyber-text-muted/20'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          isActive ? 'text-cyber-accent' : 'text-cyber-text-muted'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-cyber-text">{agent.name}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive 
                              ? 'bg-cyber-success/20 text-cyber-success' 
                              : 'bg-cyber-warning/20 text-cyber-warning'
                          }`}>
                            {agent.cost}
                          </div>
                        </div>
                        
                        <p className="text-cyber-text-secondary text-sm mb-3">
                          {agent.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-cyber-text-muted">
                            {agent.usage}
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 bg-cyber-success rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Console */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-cyber-accent" />
              <h2 className="text-xl font-semibold text-cyber-text">
                {agents.find(a => a.id === selectedAgent)?.name || 'Agent Console'}
              </h2>
            </div>
            <AgentConsole />
          </div>
          
          {/* Results & History */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-cyber-accent" />
              <h2 className="text-xl font-semibold text-cyber-text">Results & History</h2>
            </div>
            
            <div className="space-y-4">
              <AgentResultCard />
              
              {/* Task History */}
              <div className="card-cyber">
                <div className="flex items-center space-x-2 mb-4">
                  <History className="w-4 h-4 text-cyber-accent" />
                  <span className="text-sm font-medium text-cyber-text">Recent Tasks</span>
                </div>
                
                <div className="space-y-3">
                  {taskHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-cyber-text-muted mx-auto mb-2" />
                      <p className="text-cyber-text-secondary text-sm">No tasks yet</p>
                      <p className="text-cyber-text-muted text-xs">Execute an agent to see history</p>
                    </div>
                  ) : (
                    taskHistory.map((task, index) => (
                      <div key={index} className="p-3 bg-cyber-bg-tertiary border border-cyber-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-cyber-text">{task.prompt}</p>
                            <p className="text-xs text-cyber-text-muted">{task.timestamp}</p>
                          </div>
                          <button className="text-cyber-accent hover:text-cyber-accent-secondary">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
