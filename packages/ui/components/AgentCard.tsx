import React from 'react';

type Props = {
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
};

export default function AgentCard({ title, description, onAction, actionLabel = 'Run' }: Props) {
  return (
    <div className="border rounded p-4 space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <button onClick={onAction} className="px-3 py-2 rounded bg-black text-white">
        {actionLabel}
      </button>
    </div>
  );
}
