import React from 'react';
import { Target, Wand2, CheckCircle2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { InstructionCard } from './InstructionCard';
import { AskOneStepInput } from './AskOneStepInput';
import { WorkflowDefinition, WorkflowStep } from '../../types';

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
    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {/* Goal Card */}
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7656A7] uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Current Goal</span>
            </div>
            <button
              onClick={onSwitchToAgent}
              className="text-[11px] text-[#7656A7] hover:text-[#654791] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Let OneStep automate remaining steps"
            >
              <Wand2 className="w-3 h-3" />
              <span>Switch to Agent</span>
            </button>
          </div>
          <h2 className="text-xs font-bold text-[#2B2825] leading-snug">
            {workflow.title}
          </h2>
          <div className="mt-3">
            <ProgressBar
              currentStep={currentStepIndex + 1}
              totalSteps={totalSteps}
            />
          </div>
        </div>

        {/* Current Instruction Card */}
        <InstructionCard
          step={currentStep}
          onShowMe={onShowMe}
          onImStuck={onImStuck}
          onPerformStepForMe={onPerformStepForMe}
        />

        {/* Step Checklist Preview */}
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-[#6E6860] uppercase tracking-wider block mb-2">
            Workflow Pathway
          </span>
          <div className="space-y-1.5">
            {workflow.steps.map((st, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={st.id}
                  className={`flex items-center gap-2 text-xs py-1 px-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-[#7656A7]/10 text-[#7656A7] font-semibold'
                      : isPast
                      ? 'text-[#4A7C59]'
                      : 'text-[#6E6860]'
                  }`}
                >
                  <span className="font-mono tabular-nums text-[11px] w-4">
                    {isPast ? '✓' : isCurrent ? '●' : '○'}
                  </span>
                  <span className="truncate">{st.instruction}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Q&A Input */}
      <div className="pt-2">
        <AskOneStepInput
          currentGoal={workflow.title}
          currentInstruction={currentStep.instruction}
        />
      </div>
    </div>
  );
};
