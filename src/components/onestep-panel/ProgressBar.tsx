import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-primary)]">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-mono tabular-nums text-[var(--text-secondary)]">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-[var(--surface-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
