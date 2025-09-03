'use client';

// No React import needed in Next.js 13+ App Router
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function AgentResultCard({ data }: { data?: any }) {
  if (!data) {
    return (
      <div className="card-cyber text-center py-12">
        <div className="w-16 h-16 bg-cyber-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-cyber-accent" />
        </div>
        <h3 className="text-lg font-semibold text-cyber-text mb-2">No Results Yet</h3>
        <p className="text-cyber-text-secondary">
          Execute the agent to see generated content here
        </p>
      </div>
    );
  }

  const out = data?.result?.output || data?.output || {};
  const title = out?.title ?? 'Generated Content';
  const thread: string[] = out?.thread || [];
  const timestamp = data?.timestamp || new Date().toISOString();

  return (
    <div className="card-cyber space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyber-success/20 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-cyber-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-cyber-text">{title}</h3>
            <div className="flex items-center space-x-2 text-xs text-cyber-text-secondary">
              <Clock className="w-3 h-3" />
              <span>{new Date(timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="px-3 py-1 bg-cyber-success/20 text-cyber-success rounded-full text-xs font-medium">
          Generated
        </div>
      </div>

      {/* Content */}
      {thread.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyber-accent" />
            <span className="text-sm font-medium text-cyber-text">Content Thread</span>
          </div>
          
          <div className="space-y-3">
            {thread.map((item, i) => (
              <div key={i} className="p-4 bg-cyber-bg-tertiary border border-cyber-border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyber-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-cyber-accent">{i + 1}</span>
                  </div>
                  <p className="text-cyber-text-secondary text-sm leading-relaxed">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-cyber-bg-tertiary border border-cyber-border rounded-lg">
          <div className="flex items-center space-x-2 text-cyber-text-secondary">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">No structured content found in result</span>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="pt-4 border-t border-cyber-border">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-cyber-text-secondary">Model:</span>
            <span className="ml-2 text-cyber-text font-mono">{data?.model || 'gpt-3.5-turbo'}</span>
          </div>
          <div>
            <span className="text-cyber-text-secondary">Tokens:</span>
            <span className="ml-2 text-cyber-text">{data?.usage?.total_tokens || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
