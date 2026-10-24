import React, { useState } from 'react';
import { Eye, HelpCircle, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from 'lucide-react';
import { WorkflowStep } from '../../types';

interface InstructionCardProps {
  step: WorkflowStep;
  onShowMe: () => void;
  onImStuck: () => void;
  onPerformStepForMe?: () => void;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({
  step,
  onShowMe,
  onImStuck,
  onPerformStepForMe,
}) => {
  const [showWhy, setShowWhy] = useState(false);
  const [showStuckTip, setShowStuckTip] = useState(false);

  const handleStuckClick = () => {
    setShowStuckTip(true);
    onImStuck();
  };

  return (
    <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs space-y-4">
      {/* Step Header */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#7656A7] uppercase tracking-wider mb-1">
          <span>Active Instruction</span>
          <span className="font-mono tabular-nums">#{step.stepNumber}</span>
        </div>
        <h3 className="text-sm font-bold text-[#2B2825] uppercase tracking-tight">
          {step.instruction}
        </h3>
        <p className="text-xs text-[#6E6860] mt-1 leading-relaxed">
          {step.subText}
        </p>
      </div>

      {/* Action Buttons: Show me / I'm stuck */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onShowMe}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#7656A7] text-white text-xs font-semibold hover:bg-[#654791] active:scale-95 transition-all cursor-pointer shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Show me</span>
        </button>

        <button
          type="button"
          onClick={handleStuckClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#F7F3EC] text-[#2B2825] border border-[#E5DEC9] hover:bg-[#EFE9DF] text-xs font-semibold active:scale-95 transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#6E6860]" />
          <span>I'm stuck</span>
        </button>
      </div>

      {/* Stuck Hint Drawer */}
      {showStuckTip && (
        <div className="p-3 bg-[#EFE9DF]/70 border border-[#E5DEC9] rounded-lg text-xs space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#2B2825]">
              <p className="font-semibold">Need help clicking?</p>
              <p className="text-[#6E6860] mt-0.5">
                Look for the glowing highlight on the webpage. You can also click the button below and OneStep will trigger it for you:
              </p>
            </div>
          </div>
          {onPerformStepForMe && (
            <button
              onClick={() => {
                setShowStuckTip(false);
                onPerformStepForMe();
              }}
              className="w-full py-1.5 px-3 rounded-md bg-[#2B2825] text-white text-[11px] font-semibold hover:bg-[#1C1A18] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Click "{step.instruction}" for me</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Why this step? Expandable Section */}
      <div className="pt-2 border-t border-[#E5DEC9]/70">
        <button
          type="button"
          onClick={() => setShowWhy(!showWhy)}
          className="w-full flex items-center justify-between text-xs font-medium text-[#6E6860] hover:text-[#2B2825] transition-colors cursor-pointer py-1"
        >
          <span>Why this step?</span>
          {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showWhy && (
          <div className="mt-2 p-2.5 rounded-lg bg-[#F7F3EC] border border-[#E5DEC9] text-[11px] text-[#6E6860] leading-relaxed">
            {step.whyThisStep}
          </div>
        )}
      </div>
    </div>
  );
};
