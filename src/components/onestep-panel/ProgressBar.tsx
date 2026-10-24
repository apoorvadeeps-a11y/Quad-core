import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#2B2825]">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-mono tabular-nums text-[11px] text-[#6E6860]">
          {percent}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#E5DEC9] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7656A7] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
