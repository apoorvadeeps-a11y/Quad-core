import React from 'react';
import { MousePointerClick, Wand2 } from 'lucide-react';
import { AssistantMode } from '../../types';

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
      <label className="text-xs font-semibold text-[#6E6860] uppercase tracking-wider block">
        Choose Assistance Mode
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Guide Me Card */}
        <button
          type="button"
          onClick={() => onSelectMode('guide')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedMode === 'guide'
              ? 'bg-[#FFFDF9] border-[#7656A7] shadow-sm ring-1 ring-[#7656A7]'
              : 'bg-[#F7F3EC]/70 border-[#E5DEC9] hover:bg-[#FFFDF9] hover:border-[#DCD3BE]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2 rounded-lg ${
                  selectedMode === 'guide'
                    ? 'bg-[#7656A7] text-white'
                    : 'bg-[#EFE9DF] text-[#6E6860]'
                }`}
              >
                <MousePointerClick className="w-4 h-4" />
              </div>
              {selectedMode === 'guide' && (
                <span className="text-[10px] font-bold text-[#7656A7] bg-[#7656A7]/10 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <h4 className="text-xs font-bold text-[#2B2825]">GUIDE ME</h4>
            <p className="text-[11px] text-[#6E6860] mt-1 leading-snug">
              You click. OneStep shows you where to go with adaptive outlines.
            </p>
          </div>
        </button>

        {/* Do It For Me Card */}
        <button
          type="button"
          onClick={() => onSelectMode('agent')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedMode === 'agent'
              ? 'bg-[#FFFDF9] border-[#7656A7] shadow-sm ring-1 ring-[#7656A7]'
              : 'bg-[#F7F3EC]/70 border-[#E5DEC9] hover:bg-[#FFFDF9] hover:border-[#DCD3BE]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2 rounded-lg ${
                  selectedMode === 'agent'
                    ? 'bg-[#7656A7] text-white'
                    : 'bg-[#EFE9DF] text-[#6E6860]'
                }`}
              >
                <Wand2 className="w-4 h-4" />
              </div>
              {selectedMode === 'agent' && (
                <span className="text-[10px] font-bold text-[#7656A7] bg-[#7656A7]/10 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <h4 className="text-xs font-bold text-[#2B2825]">DO IT FOR ME</h4>
            <p className="text-[11px] text-[#6E6860] mt-1 leading-snug">
              OneStep performs allowed steps and asks before important actions.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
