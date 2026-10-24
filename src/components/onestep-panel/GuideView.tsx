import React from 'react';
import { Wand2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { InstructionCard } from './InstructionCard';
import { AskOneStepInput } from './AskOneStepInput';
import { WorkflowDefinition } from '../../types';

interface GuideViewProps {
  workflow: WorkflowDefinition;
  currentStepIndex: number;
  onShowMe: () => void;
  onImStuck: () => void;
  onPerformStepForMe: () => void;
  onSwitchToAgent: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({
  workflow,
  currentStepIndex,
  onShowMe,
  onImStuck,
  onPerformStepForMe,
  onSwitchToAgent,
}) => {
  const currentStep = workflow.steps[currentStepIndex] || workflow.steps[0];
  const totalSteps = workflow.steps.length;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="px-5 pt-5 pb-4 space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Current task</span>
            <button
              onClick={onSwitchToAgent}
              className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Switch to automated mode"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Do It For Me</span>
            </button>
          </div>
          <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)] leading-snug">
            {workflow.title}
          </h2>
          <ProgressBar currentStep={currentStepIndex + 1} totalSteps={totalSteps} />
        </div>

        <InstructionCard
          step={currentStep}
          onShowMe={onShowMe}
          onImStuck={onImStuck}
          onPerformStepForMe={onPerformStepForMe}
        />

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--surface-border)] bg-[var(--bg-main)]">
            <span className="text-xs font-medium text-[var(--text-primary)]">Steps</span>
          </div>
          <div className="divide-y divide-[var(--surface-border)]">
            {workflow.steps.map((st, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={st.id}
                  className={`flex items-start gap-2.5 px-3 py-2 ${
                    isCurrent ? 'bg-[var(--accent-primary)]/5' : ''
                  }`}
                >
                  <span className={`mt-0.5 text-xs ${isPast ? 'text-[var(--accent-sage)]' : isCurrent ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
                    {isPast ? '✓' : isCurrent ? '•' : '○'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isCurrent ? 'font-medium text-[var(--text-primary)]' : isPast ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}`}>
                      {st.instruction}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto px-5 pb-5">
        <AskOneStepInput currentGoal={workflow.title} currentInstruction={currentStep.instruction} />
      </div>
    </div>
  );
};
