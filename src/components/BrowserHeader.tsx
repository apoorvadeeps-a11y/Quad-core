import React from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Sparkles } from 'lucide-react';
import { PortalRoute, FinanceTab, AssistantMode } from '../types';

interface BrowserHeaderProps {
  currentRoute: PortalRoute;
  currentFinanceTab?: FinanceTab;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onReload: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  layoutRatio: number;
  onSelectPreset: (ratio: number) => void;
  mode: AssistantMode;
}

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  currentRoute,
  currentFinanceTab,
  onNavigateBack,
  onNavigateForward,
  onReload,
  canGoBack,
  canGoForward,
  layoutRatio,
  onSelectPreset,
  mode,
}) => {
  let path = `/student/${currentRoute}`;
  if (currentRoute === 'finance' && currentFinanceTab) {
    path += `/${currentFinanceTab}`;
  }

  return (
    <header className="h-[3.25rem] bg-[var(--surface-card)] border-b border-[var(--surface-border)] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 mr-1">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">OneStep</span>
            <span className="text-[10px] text-[var(--text-secondary)]">AI Navigation Assistant</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
          <button
            onClick={onNavigateBack}
            disabled={!canGoBack}
            aria-label="Back"
            className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateForward}
            disabled={!canGoForward}
            aria-label="Forward"
            className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            aria-label="Reload page"
            className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--surface-border)] rounded-lg px-3 py-1.5 max-w-[28rem] w-full text-xs text-[var(--text-primary)] shadow-[0_1px_0_rgba(41,39,32,0.01)]">
          <Lock className="w-3.5 h-3.5 text-[var(--accent-sage)] shrink-0" />
          <span className="text-[var(--text-secondary)] select-none">https://</span>
          <span className="font-medium">portal.apexstate.edu</span>
          <span className="text-[var(--accent-primary)] font-mono text-[11px] truncate">{path}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center bg-[var(--bg-main)] p-0.5 rounded-lg border border-[var(--surface-border)] text-xs">
          {[80, 70, 60].map((ratio) => (
            <button
              key={ratio}
              onClick={() => onSelectPreset(ratio)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                Math.round(layoutRatio) === ratio
                  ? 'bg-[var(--surface-card)] text-[var(--accent-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title={`${ratio}:${100 - ratio} split`}
            >
              {ratio}:{100 - ratio}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-[var(--surface-border)]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
            <span className="hidden lg:inline">Local AI Ready</span>
            <span className="lg:hidden">Ready</span>
          </div>
          {mode !== 'idle' && (
            <span className="hidden xl:inline-flex text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--surface-border)]">
              {mode === 'guide' ? 'Guide Me' : 'Do It For Me'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
