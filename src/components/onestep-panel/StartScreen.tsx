import React, { useState } from 'react';
import { Sparkles, ArrowRight, Compass, Search } from 'lucide-react';
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
    <div className="p-5 space-y-6 flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-5">
        {/* Intro */}
        <div>
          <h2 className="text-lg font-bold text-[#2B2825] tracking-tight">
            What would you like to do?
          </h2>
          <p className="text-xs text-[#6E6860] mt-1 leading-relaxed">
            Tell OneStep your goal and choose whether you want interactive visual guidance or automated execution.
          </p>
        </div>

        {/* Goal Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe what you want to accomplish..."
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
        <div className="space-y-2.5 pt-1 border-t border-[#E5DEC9]/80">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6E6860] uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#7656A7]" />
            <span>Suggested Tasks</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {SUGGESTED_GOALS.map((suggested) => (
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
      <div className="pt-4 border-t border-[#E5DEC9]">
        <button
          onClick={handleSubmit}
          disabled={!goal.trim()}
          className="w-full py-2.5 px-4 rounded-xl bg-[#7656A7] hover:bg-[#654791] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>Start {selectedMode === 'guide' ? 'Guided Steps' : 'Automated Run'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <p className="text-[10px] text-center text-[#6E6860] mt-2">
          Local assistant simulation · No external API keys required
        </p>
      </div>
    </div>
  );
};
