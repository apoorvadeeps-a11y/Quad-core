import React, { useState } from 'react';
import { Eye, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showStuck, setShowStuck] = useState(false);

  const handleStuck = () => {
    setShowStuck(true);
    onImStuck();
  };

  return (
    <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] overflow-hidden shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center text-xs font-medium">
            {step.stepNumber}
          </span>
          <span className="text-xs font-medium text-[var(--text-secondary)]">Next step</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
          {step.instruction}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {step.subText}
        </p>

        <button
          type="button"
          onClick={() => setShowWhy(!showWhy)}
          className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium cursor-pointer transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why this step</span>
          {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showWhy && (
          <div className="bg-[var(--bg-main)] border border-[var(--surface-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            {step.whyThisStep}
          </div>
        )}
      </div>

      <div className="px-4 pb-4 space-y-2">
        <button
          type="button"
          onClick={onShowMe}
          className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Show me</span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleStuck}
            className="py-2 px-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] text-sm text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            I'm stuck
          </button>
          {onPerformStepForMe && (
            <button
              type="button"
              onClick={onPerformStepForMe}
              className="py-2 px-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] text-sm text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Do this step
            </button>
          )}
        </div>
        {showStuck && (
          <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--bg-main)] px-3 py-2 text-xs text-[var(--text-secondary)]">
            Look for the highlighted element on the website. Use "Show me" to focus it.
          </div>
        )}
      </div>
    </div>
  );
};
