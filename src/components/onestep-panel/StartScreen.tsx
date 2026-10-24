import React, { useState } from 'react';
import { Sparkles, ArrowRight, Compass, Server, Settings } from 'lucide-react';
import { ModeSelector } from './ModeSelector';

interface StartScreenProps {
  onStartWorkflow: (goalText: string, mode: 'guide' | 'agent') => void;
  ollamaModelTag: string;
  ollamaBaseUrl: string;
  onOpenSettings: () => void;
}

const CROSS_SITE_SUGGESTIONS = [
  'Download my university fee receipt',
  'Apply for degree certificate and autofill details',
  'Find my academic results and marksheet',
  'Check attendance shortage compliance',
];

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartWorkflow,
  ollamaModelTag,
  ollamaBaseUrl,
  onOpenSettings,
}) => {
  const [goal, setGoal] = useState('Download my university fee receipt');
  const [selectedMode, setSelectedMode] = useState<'guide' | 'agent'>('guide');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    onStartWorkflow(goal.trim(), selectedMode);
  };

  return (
    <div className="p-5 space-y-5 flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {/* Intro */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-[#2B2825] tracking-tight">
              What would you like to do?
            </h2>
            <button
              onClick={onOpenSettings}
              className="text-[11px] text-[#7656A7] hover:underline flex items-center gap-1 cursor-pointer"
              title="Configure Ollama LAN settings"
            >
              <Settings className="w-3 h-3" />
              <span>Ollama Settings</span>
            </button>
          </div>
          <p className="text-xs text-[#6E6860] leading-relaxed">
            OneStep inspects the active webpage DOM and uses <strong>Qwen 2.5</strong> via Ollama on your Wi-Fi network to plan the next step.
          </p>
        </div>

        {/* Ollama Connection Chip */}
        <div className="p-2.5 bg-[#F7F3EC] border border-[#E5DEC9] rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Server className="w-3.5 h-3.5 text-[#7656A7] shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold text-[#2B2825] truncate block">
                Model: {ollamaModelTag}
              </span>
              <span className="text-[10px] text-[#6E6860] font-mono truncate block">
                Host: {ollamaBaseUrl}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-[10px] px-2 py-1 rounded-md bg-[#EFE9DF] hover:bg-[#E5DEC9] font-medium text-[#2B2825] shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* Goal Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe what you want to accomplish on this page..."
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FFFDF9] text-xs font-medium text-[#2B2825] placeholder:text-[#A09A90] focus:outline-none focus:ring-2 focus:ring-[#7656A7] focus:border-transparent shadow-xs transition-all"
            />
            <button
              type="submit"
              disabled={!goal.trim()}
              aria-label="Start task"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#7656A7] text-white disabled:opacity-40 hover:bg-[#654791] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Selector */}
          <ModeSelector
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
          />
        </form>

        {/* Suggested Tasks */}
        <div className="space-y-2 pt-1 border-t border-[#E5DEC9]/80">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6E6860] uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#7656A7]" />
            <span>Suggested Cross-Site Tasks</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {CROSS_SITE_SUGGESTIONS.map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => setGoal(suggested)}
                className="w-full text-left px-3 py-2 rounded-lg bg-[#F7F3EC] hover:bg-[#EFE9DF] border border-[#E5DEC9] text-xs text-[#2B2825] font-medium transition-colors cursor-pointer flex items-center justify-between group"
              >
                <span className="truncate">{suggested}</span>
                <span className="text-[10px] text-[#7656A7] opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0 ml-2">
                  Use goal →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button bottom pinned */}
      <div className="pt-3 border-t border-[#E5DEC9]">
        <button
          onClick={handleSubmit}
          disabled={!goal.trim()}
          className="w-full py-2.5 px-4 rounded-xl bg-[#7656A7] hover:bg-[#654791] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>Start {selectedMode === 'guide' ? 'Guided Steps' : 'Automated Run'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <p className="text-[10px] text-center text-[#6E6860] mt-1.5">
          Qwen 2.5 local inference on trusted Wi-Fi · Zero external tracking
        </p>
      </div>
    </div>
  );
};
