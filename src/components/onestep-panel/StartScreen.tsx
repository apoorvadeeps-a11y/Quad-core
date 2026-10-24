import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ModeSelector } from './ModeSelector';
import { SUGGESTED_GOALS } from '../../data/workflows';

interface StartScreenProps {
  onStartWorkflow: (goalText: string, mode: 'guide' | 'agent') => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartWorkflow }) => {
  const [goal, setGoal] = useState('Download my university fee receipt');
  const [selectedMode, setSelectedMode] = useState<'guide' | 'agent'>('guide');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    onStartWorkflow(goal.trim(), selectedMode);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="px-5 pt-6 pb-4 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-[var(--accent-primary)]">OneStep</span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Where would you like to go?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Tell OneStep what you want to accomplish. I'll help you find the right steps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Download my university fee receipt..."
              className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/25 focus:border-[var(--accent-primary)]/40 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!goal.trim()}
              aria-label="Start task"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[var(--accent-primary)] text-white disabled:opacity-40 hover:bg-[var(--accent-primary-hover)] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />
        </form>

        <div className="space-y-2 pt-4 border-t border-[var(--surface-border)]">
          <span className="text-xs font-medium text-[var(--text-secondary)]">Quick suggestions</span>
          <div className="flex flex-col gap-1.5">
            {SUGGESTED_GOALS.map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => setGoal(suggested)}
                className="w-full text-left px-3 py-2 rounded-lg border border-transparent hover:border-[var(--surface-border)] hover:bg-[var(--surface-secondary)] text-sm text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto px-5 pb-5">
        <button
          onClick={handleSubmit}
          disabled={!goal.trim()}
          className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-white text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start task</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-center text-[var(--text-secondary)] mt-2">
          Local prototype · No backend calls
        </p>
      </div>
    </div>
  );
};
