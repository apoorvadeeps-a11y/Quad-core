import React from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Sparkles, LayoutGrid, Monitor } from 'lucide-react';
import { PortalRoute, FinanceTab, AssistantMode } from '../types';

interface BrowserHeaderProps {
  currentRoute: PortalRoute;
  currentFinanceTab?: FinanceTab;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onReload: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  layoutRatio: number; // e.g. 70 for 70:30
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
  // Construct dynamic realistic URL based on state
  let path = `/student/${currentRoute}`;
  if (currentRoute === 'finance' && currentFinanceTab) {
    path += `/${currentFinanceTab}`;
  }

  return (
    <header className="h-13 bg-[#FFFDF9] border-b border-[#E5DEC9] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Browser Navigation & Security */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[#6E6860]">
          <button
            onClick={onNavigateBack}
            disabled={!canGoBack}
            aria-label="Back"
            className="p-1.5 rounded-md hover:bg-[#EFE9DF] disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateForward}
            disabled={!canGoForward}
            aria-label="Forward"
            className="p-1.5 rounded-md hover:bg-[#EFE9DF] disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            aria-label="Reload page"
            className="p-1.5 rounded-md hover:bg-[#EFE9DF] transition-colors cursor-pointer text-[#6E6860] hover:text-[#2B2825]"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex items-center gap-2 bg-[#F7F3EC] border border-[#E5DEC9] rounded-lg px-3 py-1.5 w-72 md:w-96 text-xs text-[#2B2825] shadow-xs">
          <Lock className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" />
          <span className="text-[#6E6860] select-none font-medium">https://</span>
          <span className="font-medium text-[#2B2825]">portal.apexstate.edu</span>
          <span className="text-[#7656A7] font-mono text-[11px] truncate">{path}</span>
        </div>
      </div>

      {/* Middle/Right: Layout Presets & OneStep Status */}
      <div className="flex items-center gap-3">
        {/* Layout Presets (70:30, 60:40, 80:20) */}
        <div className="hidden sm:flex items-center bg-[#F7F3EC] p-0.5 rounded-lg border border-[#E5DEC9] text-xs">
          <button
            onClick={() => onSelectPreset(80)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              Math.round(layoutRatio) === 80
                ? 'bg-[#FFFDF9] text-[#7656A7] shadow-xs font-semibold'
                : 'text-[#6E6860] hover:text-[#2B2825]'
            }`}
            title="80:20 — More website space"
          >
            80:20
          </button>
          <button
            onClick={() => onSelectPreset(70)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              Math.round(layoutRatio) === 70
                ? 'bg-[#FFFDF9] text-[#7656A7] shadow-xs font-semibold'
                : 'text-[#6E6860] hover:text-[#2B2825]'
            }`}
            title="70:30 — Default split"
          >
            70:30
          </button>
          <button
            onClick={() => onSelectPreset(60)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              Math.round(layoutRatio) === 60
                ? 'bg-[#FFFDF9] text-[#7656A7] shadow-xs font-semibold'
                : 'text-[#6E6860] hover:text-[#2B2825]'
            }`}
            title="60:40 — More assistant space"
          >
            60:40
          </button>
        </div>

        {/* Assistant Status Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E5DEC9]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7656A7]/10 border border-[#7656A7]/20 text-[#7656A7] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7656A7] animate-pulse" />
            <span>Local AI Ready</span>
          </div>
          {mode !== 'idle' && (
            <span className="hidden md:inline-flex text-xs font-medium px-2 py-0.5 rounded-md bg-[#EFE9DF] text-[#2B2825] border border-[#E5DEC9]">
              {mode === 'guide' ? 'Guide Mode' : 'Agent Mode'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
