import React from 'react';
import { MousePointerClick, Wand2 } from 'lucide-react';

interface ModeSelectorProps {
  selectedMode: 'guide' | 'agent';
  onSelectMode: (mode: 'guide' | 'agent') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-[var(--text-secondary)] block">
        Choose how you'd like help
      </span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelectMode('guide')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMode === 'guide'
              ? 'bg-[var(--surface-card)] border-[var(--accent-primary)]/60 shadow-sm'
              : 'bg-[var(--surface-card)] border-[var(--surface-border)] hover:border-[var(--accent-primary)]/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                selectedMode === 'guide'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Guide Me</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            You click, I'll show you where to go.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('agent')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMode === 'agent'
              ? 'bg-[var(--surface-card)] border-[var(--accent-primary)]/60 shadow-sm'
              : 'bg-[var(--surface-card)] border-[var(--surface-border)] hover:border-[var(--accent-primary)]/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                selectedMode === 'agent'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Do It For Me</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            I'll work through it and ask before key actions.
          </p>
        </button>
      </div>
    </div>
  );
};
